---
layout: post
title: DevRel/Asia 2020のWebサイトの仕組み
post_id: 2
date:   2020-08-13 00:00:00 +0900
catch: devrel-asia-website.png
author: goofmint
language: ja
---

今回はDevRel/Asia 2020のWebサイトがどういう仕組みになっているのか紹介します。基本的な仕組みは私が主催している[DevRelCon Tokyo](https://tokyo-2020.devrel.net/)のものを踏襲していますが、多言語対応において大幅に変更しています。

<!--more-->

コンセプトは次のようになっています。

- サーバレス
- 静的
- 多言語化
- 容易なメンテナンス


## サーバレス

まずサーバレスについてです。DevRel/Asia 2020では、次のようなサービスを組み合わせて構築しています。

- [GitHub Pages](https://docs.github.com/en/github/working-with-github-pages)
- [GitHub Action](https://github.co.jp/features/actions)
- [Googleスプレッドシート](https://www.google.com/intl/en/sheets/about/)
- [ニフクラ mobile backend](https://mbaas.nifcloud.com/)
- [Customers Mail Cloud](https://smtps.jp/)
- [Slack](https://slack.com/)
- [Mailchimp](https://mailchimp.com/)
- [Buffer](https://buffer.com/)

WebサイトはGitHub Pages上にデプロイしています。静的Webサイトエンジンとして、[Jekyll](https://jekyllrb-ja.github.io/)を使っています。JekyllはデータファイルとしてJSONやYAMLを使えますので、例えば主催者情報をJSONデータで用意して、それを更新してあげればWebサイトも自動的にアップデートされます。

![](/asia-2020/assets/articles/devrel-asia-website-1.png)

そのデータ元としてGoogleスプレッドシートを使っています。Googleスプレッドシートでは主に次のようなデータを管理しています。

- 主催者情報
- 翻訳情報
- スポンサー情報
- その他色々

Googleスプレッドシート上にあるデータを取得するために、Google Apps ScriptでJSONでデータを出力するAPIを用意しています。このAPIを定期的に叩いて、Jekyll上のファイルを更新しています。Google Apps ScriptをWeb APIとして公開することで、次のようにデータを取得できます。

```
wget -O _data/organizers.json https://script.google.com/macros/s/xxxxxxxxxx/exec?name=organizers
```

定期的に呼び出す仕組みに使っているのがGitHub Actionになります。GitHub Actionはcronとして毎分（実際には8分ごとになっているようです）、masterへのプッシュのタイミングでデータの更新を行っています。以下はGitHub Actionの設定の一部です。

{% raw %}
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Build the site in the jekyll/builder container
      uses: actions/checkout@v2
      with:
        persist-credentials: false
        fetch-depth: 0
    - name: Create local changes
      run: |
        wget -O ${{ github.workspace }}/_data/organizers.json ${{ secrets.URL }}?name=organizers
        wget -O ${{ github.workspace }}/_data/faq.json ${{ secrets.URL }}?name=faq
        wget -O ${{ github.workspace }}/_data/translates.json ${{ secrets.URL }}?name=translates
        wget -O ${{ github.workspace }}/_data/sponsors.json ${{ secrets.URL }}?name=sponsors
```
{% endraw %}

### CFPについて

CFPは専用のフォームを用意しています。元々[PaperCall](https://www.papercall.io/)を使っていたのですが、多言語対応していないために英語以外の言語を使っていいのか分からないといった質問や、登壇時に使いたい言語が選択できないといった問題がありました。そうした説明をPaperCall上に記述する方法もありますが、今回は6言語（英語、日本語、韓国語、中国語、インドネシア語、ベトナム語）あるので現実的ではありません。そこで、CFPのフォームを独自に用意して、多言語対応することにしました。

![](/asia-2020/assets/articles/devrel-asia-website-2.png)

多言語対応する方法は後述するとして、CFPフォームから送信するとニフクラ mobile backendにデータが送信されます。これは次のような理由があります。

- Google Apps Scriptを呼び出す方式の場合、中国本土から送信できない（Googleのサービスが弾かれる）
- Google Apps ScriptをPOSTでREST API化するのはちょっと面倒（後で対応しましたが…）

ニフクラ mobile backendではデータの登録時にACL（アクセス制限）が行えるので、CFPの登録はできるけれど、閲覧も削除もできないデータにするのが簡単です。そして、ニフクラ mobile backendに登録されたデータはGoogle Apps Scriptの時間ベースのトリガーによって、Googleスプレッドシートに反映されます。

![](/asia-2020/assets/articles/devrel-asia-website-4.png)

データの反映時には、CFP投稿者に対してCFP登録確認を伝えるメールを送信しています。ここはCustomers Mail Cloudを使っています。また、Slackの主催者チャンネルにCFPが届いた旨の通知をしています。

### CFPの投票について

PaperCallを使っている場合の難点として、無料版では5人までしか投票に参加できないという課題があります。もちろん有料版にすればいいのですが、今回は独自フォームにすることで、その課題も解決できました。Google Apps Scriptを使って独自の投票用フォームを用意しました。これで、主催者（DevRel/Asia 2020には30人を超える主催者がいます）全員が投票に参加できます。

![](/asia-2020/assets/articles/devrel-asia-website-5.png)

この投票フォームはGoogle Apps Script上に作られているので、データの読み出しや投票結果の反映も簡単に実装できます。投票結果はもちろんGoogleスプレッドシート上に蓄積されています。

### メールの問い合わせ

![](/asia-2020/assets/articles/devrel-asia-website-6.png)

カンファレンスサイトには問い合わせフォームが付きものです。これは2つの入り口があります。

- 専用フォームでの問い合わせ
- メールでの問い合わせ

まず専用フォームでの問い合わせですが、これはニフクラ mobile backendにデータを送って、その中でスクリプト機能を実行しています。それはSlackチャンネルへ直接メッセージを送っています。

![](/asia-2020/assets/articles/devrel-asia-website-14.png)

メールでの問い合わせですが、これはメールアドレス（asia-2020@devrel.dev）をCustomers Mail Cloudに登録しておき、Google Apps ScriptのdoPostをWebhookとして呼び出しています。メールのToがasia-2020@devrel.devであれば、すべてのメールがGoogle Apps Scriptを介してSlackチャンネルに届く仕組みです。ニフクラ mobile backendを使わなかったのは、Customers Mail CloudのWebhookではニフクラ mobile backendのリクエストに必要な署名生成に対応していないためです。逆にいえば、ニフクラ mobile backendのスクリプト機能を署名なしで呼び出す方法がないためともいえます。

![](/asia-2020/assets/articles/devrel-asia-website-8.png)

メール返信フォームはGoogleフォームで作成しています。そしてフォーム送信時のスクリプトで、メール送信を行っています。メール送信はCustomers Mail Cloudを使っています。このメリットとして、Googleフォームでの送信結果を記録として残しておけること、メールの送信元を固定（asia-2020@devrel.dev）できることが挙げられます。必要があればCCに常に asia-2020@devrel.dev を追加することもできます。

![](/asia-2020/assets/articles/devrel-asia-website-15.png)

### 更新情報のメール

更新情報を伝えるメールについてはMailchimpを使っています。これについては取り立てていうことはありません。手軽に使えて素晴らしいサービスです。

![](/asia-2020/assets/articles/devrel-asia-website-9.png)

### ソーシャルへの投稿

今回のDevRel/Asia 2020では以下のソーシャルチャンネルを持っています。

- [Twitter](https://twitter.com/devrelasia)
- [Facebook](https://www.facebook.com/DevRelAsia-2020-112538220512123)
- [LinkedIn](https://www.linkedin.com/company/67198680/)

このそれぞれのチャンネルに対してメッセージを作るのは面倒です。そこで、Bufferを使っています。BufferにはAPIがあり、あらかじめ登録してあるソーシャルサービスに対してメッセージを一括登録できます。

![](/asia-2020/assets/articles/devrel-asia-website-10.png)

そこでGoogleフォームを使ってソーシャル投稿用のフォームを用意しました。入力内容はGoogleスプレッドシートに登録されます。そして、Googleスプレッドシートの内容を定期的にBufferへ登録するスクリプトも用意しています。

![](/asia-2020/assets/articles/devrel-asia-website-11.png)

この大きなメリットは、各担当者を各ソーシャルサービスに登録しなくて済むことです。TwitterであればTweetDeck、FacebookやLinkedInの管理者への登録なども不要です。担当者は一つのフォームに入力すれば、各サービスにメッセージを送信できます。

![](/asia-2020/assets/articles/devrel-asia-website-16.png)

また、Googleスプレッドシートなので、式を使ってメッセージをバルクで作れるのもメリットです。例えば主催者情報を紹介するメッセージをまとめて作ったり、スピーカー候補者に対してまとめてメッセージを作ったりできます。定型的なメッセージであれば一気にまとめて作れます。配信時間の操作も式を使えば簡単です（前の投稿の5分後と設定するなど）。

**このようなサービス群を組み合わせることで、DevRel/Asia 2020のWebサイトはサーバレス、かつ無料枠の中で管理、運用されています。**

## 静的

カンファレンスを管理するCMSもありますが、意外と運用が面倒だったりします。WordPressプラグインにもあるのですが、Googleスプレッドシートの方が入力がよっぽども簡単です。サーバの運用も面倒ですし、セキュリティリスクも多少なりとも存在します。

そのためDevRel/Asia 2020については、DevRelCon Tokyoを踏襲して静的サイトにこだわって運用されています。GitHub Pagesであれば無料でSSLホスティングもできますし、安定稼働できます。HTMLであればセキュリティリスクはほぼ皆無です。

## 多言語化

今回苦労したのが多言語化です。DevRelCon Tokyoの場合、英語または日本語の二つだけで済みました。今回は先に挙げた通り、6言語です。まず翻訳キーを用意しました。

| キー | 英語 | 日本語 | 韓国語 | ベトナム語 | インドネシア語 |
|------|------|-------|-------|-----------|---------------|
| intro2 | About The Conference | カンファレンスについて | 컨퍼런스 소개 | Về Hội Nghị | Tentang Konferensi |

このように英語から別言語にするのではなく、キーを用いてそれぞれに翻訳する形にしています。問題はすべての翻訳が完了している訳ではなく、一部には抜けがあるということです。翻訳が間に合っていない場合、空っぽになってしまうのは問題です。つまり翻訳が用意されていない場合は英語、翻訳がある場合は現地語を表示する必要があります。

Jekyllでそこまで作り込むのは大変だったため、今回はあらかじめRubyを使って処理するようにしました。これはGitHub Actionsの中で実行しています。翻訳されていれば、そちらを優先し、なければキーに対して英語の文字列を適用するようにしています。この結果、Jekyll側での処理はシンプルになっています。

すべての表示に対して、次のように処理を書いています。

{% raw %}
```
{% assign messages = site.data.i18n.faq1 %}
{% include translate.html %}
```
{% endraw %}

本当は次のように書けるとよかったのですが、Jekyllでは include されたファイルの中で、include を用いる際に変数を定義することができないようです。そこで毎回 assign を使っています。

{% raw %}
```
{% include translate.html messages = site.data.i18n.faq1 %}
```
{% endraw %}

翻訳文は次のように並列で出力しています。そして初期状態では `.lang` をすべて非表示にしています。

{% raw %}
```html
<span class="lang en">{{ messages.english }}</span>
<span class="lang ja">{{ messages.japan }}</span>
<span class="lang ko">{{ messages.korea }}</span>
<span class="lang zh">{{ messages.hongkong }}</span>
<span class="lang id">{{ messages.indonesia }}</span>
<span class="lang vi">{{ messages.vietnam }}</span>
```
{% endraw %}

後はJavaScriptを使って、Webサイトを表示した際にWebブラウザの言語を認識して表示に反映しています。言語認識の処理は [blang](https://github.com/cupof-github/blang.js) というライブラリを用いています。

```js
$('.lang').hide();
if (blang.is.en()) {
  $('.lang.en').show();
} else if (blang.is.ja()) {
  $('.lang.ja').show();
}
// 以下省略
```

なお、日本ではあまり見ないのですが、海外の方の場合、基本が英語で、2番目以降に現地語を設定している場合があります。この時、優先順位としては英語が優先されてしまい、せっかく現地語に対応していても使われなくなってしまいます。そこで、Webブラウザに設定されている言語（複数）を取得して、その中に現地語があれば、それを使うか通知する仕組みを用意しています。

![](/asia-2020/assets/articles/devrel-asia-website-12.png)

```js
const langs = navigator.languages;
if (langs.includes('ko')) {
  $('#language_change').attr('title', '여기에서 표시 언어를 영어에서 한국어로 변경할 수 있습니다.');
  $('[data-toggle="tooltip"]').tooltip('show');
}
if (langs.includes('vi')) {
  $('#language_change').attr('title', 'Bạn có thể thay đổi ngôn ngữ hiển thị tại đây');
  $('[data-toggle="tooltip"]').tooltip('show');
}
```

この方法でおおむね問題ないのですが、いくつかの課題もあります。

- OGP（Open Graph Protocol）には英語しか使えない
- selectタグのoptionに対して多言語処理が適用できない
- 入力値のplaceholderに対して多言語処理が適用できない
- Markdown表示の際に、うまく他の言語が隠せない

解決できていない問題もありますが、例えばMarkdownであればJavaScriptでMarkdownをレンダリングするようにすれば解決できます。

## 容易なメンテナンス

静的サイトであること、Googleスプレッドシートを使うことでメンテナンス性が大幅に下がります。表形式であれば、誰でも編集した経験があるでしょう。専用の管理画面を作って、そこで複雑な処理をするよりも、よっぽども簡単です。

![](/asia-2020/assets/articles/devrel-asia-website-13.png)

情報が散在するのは、この手の多人数での作業において最も問題になります。見ればいい場所は少なく、固定化されているのがお勧めです。今回であればGoogle DriveとSlackしか使っていません。メールもすべてSlackに来ますし、ミーティングの議事録もGoogle Drive上に保存されています。CFPの投票も、ソーシャルへの投稿もGoogleフォームで完結します。

## まとめ

DevRel/Asia 2020の裏側を紹介しました。サーバレスで運用することで、サーバの管理から解放され、カンファレンスの運用に集中できます。データの管理と表示を分離したことで、問題が発生した際の切り分けも簡単になります。

皆さんが自分のカンファレンスやコミュニティでWebサイトを運用する際の参考にしてください！
