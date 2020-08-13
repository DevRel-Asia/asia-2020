---
layout: post
title: How the DevRel/Asia 2020 website works
post_id: 2
date:   2020-08-13 00:00:00 +0900
catch: devrel-asia-website.png
author: goofmint
language: en
---

I'd like to introduce the architecture of the DevRel/Asia 2020 website. The basic architecture of the website follows that of [DevRelCon Tokyo](https://tokyo-2020.devrel.net/), which I am organizing. But with major changes in terms of multilingual support.

<!--more-->

The concept is as follows

- Serverless
- Static
- Multiple languages support
- Easy maintenance

## Serverless

First, let's write about serverless. DevRel/Asia 2020 is built on a combination of the following services.

- [GitHub Pages](https://docs.github.com/en/github/working-with-github-pages)
- [GitHub Action](https://github.co.jp/features/actions)
- [Google Sheets](https://www.google.com/intl/en/sheets/about/)
- [Nifcloud mobile backend](https://mbaas.nifcloud.com/)
- [Customers Mail Cloud](https://smtps.jp/)
- [Slack](https://slack.com/)
- [Mailchimp](https://mailchimp.com/)
- [Buffer](https://buffer.com/)

Out website is deployed on GitHub Pages. And we are used [Jekyll](https://jekyllrb-ja.github.io/) a static website engine. Jekyll can use JSON and YAML as a data file. So for example, we prepare JSON data for the organizer and update it. the website will also be updated automatically.

![](/asia-2020/assets/articles/devrel-asia-website-1.png)

We use Google Sheets as the source of this data, which mainly manages the following data.

- Organiser Information
- Translation Information
- Sponsor Information
- etc.

In order to get the data on Google Sheets, we developed an API to output the data in JSON in Google Apps Script. We periodically hit this API to update the files on Jekyll, and by exposing Google Apps Script as a web API, we can get the data as follows.

```
wget -O _data/organizers.json https://script.google.com/macros/s/xxxxxxxxxx/exec?name=organizers
```

GitHub Action is used to periodically update data as a cron every minute (actually it seems to be every 8 minutes) when it is pushed to master. Here's a partial configuration of GitHub Action.

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
        wget -O ${{ github.workspace }}/_data/translates.json ${{ secrets.URL }}?name=translates
```
{% endraw %}

### About CFP

The CFP has a dedicated form. Originally, we used to use [PaperCall](https://www.papercall.io/), but there were some problems, such as not knowing which language to use because it does not support multiple languages, and not being able to select the language speaker want to use when they speak. There is a way to describe such explanation on PaperCall, but it is not practical since there are 6 languages (English, Japanese, Korean, Chinese, Indonesian and Vietnamese). So, we prepared the CFP form independently and decided to support multiple languages.

![](/asia-2020/assets/articles/devrel-asia-website-2.png)

I will write later on how to support multiple languages. When someone submit a CFP form, the data is sent to Nifcloud mobile backend. There are several reasons for this.

- If the person call Google Apps Script, they can't send from mainland China (Google's service will be blocked).
- Turning Google Apps Script into a REST API with POST is a bit of a hassle (I dealt with it later...)

Nifcloud mobile backend allows person to restrict ACLs (Access Control Law) at the time of data registration. So it's easy to register CFPs, but not to view or delete them. And the data registered in Nifcloud mobile backend will be reflected in Google Spreadsheet by Google Apps Script time-based triggers.

![](/asia-2020/assets/articles/devrel-asia-website-4.png)

When the data is reflected, we send an email to CFP contributors, telling them to confirm their CFP registration. We use Customers Mail Cloud for sending email. We also notify the organizer channel in Slack that the CFP has been received.

### Voting CFP

One of the weak points of using PaperCall is that the free version only allows up to 5 people to participate in voting. Of course, we could have gone with a paid version. But in this case, we solved that problem by using our own form, which we created using Google Apps Script to develop our own voting form. Now all the organizers (there are over 30 organizers at DevRel/Asia 2020) can participate in the voting.

![](/asia-2020/assets/articles/devrel-asia-website-5.png)

The voting form is built on Google Apps Script, so it's easy to read the data and implement the voting results. Voting results are, of course, stored in a Google Sheets.

### Contact by email

![](/asia-2020/assets/articles/devrel-asia-website-6.png)

The conference is accompanied by a contact form. We have two entrances.

- Using the embeded form
- By email

The first thing we do is send a dedicated form inquiry, which sends data to Nifcloud mobile backend and runs a scripting function in it. It's sending a message directly to the Slack channel.

![](/asia-2020/assets/articles/devrel-asia-website-14.png)

By email, this is an email address (asia-2020@devrel.dev) registered in the Customers Mail Cloud, which calls doPost function in Google Apps Script by webhook. If the email is addressed to asia-2020@devrel.dev, all emails are delivered to the Slack channel via Google Apps Script. I didn't use Nifcloud mobile backend because the Customers Mail Cloud webhook doesn't support the signature generation required for Nifcloud mobile backend requesting. In other words, there is no way to invoke Nifcloud mobile backend scripting without a signature.

![](/asia-2020/assets/articles/devrel-asia-website-8.png)

The email reply form is created in Google Forms. And the script for the form submission is used to send the email. We use Customers Mail Cloud for email submissions. The advantage of this is that we can keep a record of the results of the Google Form submissions and we can use asia-2020@devrel.dev as From. We can also always add asia-2020@devrel.dev to CC if we need to.

![](/asia-2020/assets/articles/devrel-asia-website-15.png)

### Update email

We use Mailchimp for email updates. We don't have anything special to say about it. It's easy to use and it's a great service.

![](/asia-2020/assets/articles/devrel-asia-website-9.png)

### Posting social

We have the following social channels at DevRel/Asia 2020

- [Twitter](https://twitter.com/devrelasia)
- [Facebook](https://www.facebook.com/DevRelAsia-2020-112538220512123)
- [LinkedIn](https://www.linkedin.com/company/67198680/)

Creating a message for each of these channels is hard, so we use Buffer. We use Buffer, which has an API that allows to batch submit messages to pre-registered social services.

![](/asia-2020/assets/articles/devrel-asia-website-10.png)

So we've created a form for social submissions using Google Forms. The information you enter will be stored in a Google Sheets, and we have a script that periodically registers the content in the Google Sheets. We also included a script that periodically registers the contents of the Google Sheet to Buffer.

![](/asia-2020/assets/articles/devrel-asia-website-11.png)

The big advantage of this architecture is that we don't have to register each account to each social service - no more TweetDeck for Twitter, no more registering for Facebook or LinkedIn admins. The person in charge will be able to send messages to each service by filling out one form.

![](/asia-2020/assets/articles/devrel-asia-website-16.png)

Another advantage is that since it's a Google Sheets, we can create messages in bulk using formulas. For example, we can create messages in bulk to introduce organizer information, or we can create messages in bulk for potential speakers. If it's a standard message, we can create a batch of messages at once. The delivery time can be easily manipulated using formulas (e.g., set it to 5 minutes after the previous post).

**The combination of these services allows us to manage and operate the DevRel/Asia 2020 website in a serverless and free.**

## Static

There is a CMS for managing conferences, but it can be a pain to use. There is WordPress plugin, but Google Sheets is much easier to operate. Managing servers is also a hard, and there are also some security risks.

For this reason, DevRel/Asia 2020 has been designed to be a static site, following in the footsteps of DevRelCon Tokyo, with free SSL hosting and stable operation with GitHub Pages.

## Multiple languages support

The hardest part of the conference was going multilingual. At DevRelCon Tokyo, we only had to use two languages, English and Japanese. This time, as we mentioned earlier, there are 6 languages. First, we prepared a translation key.

| Key | English | Japanese | Korean | Vietnamese | Indonesian |
|------|------|-------|-------|-----------|---------------|
| intro2 | About The Conference | カンファレンスについて | 컨퍼런스 소개 | Về Hội Nghị | Tentang Konferensi |

Instead of translating from English to another language in this way, We're using keys to translate each one. The problem is that not all translations are complete, and some are missing. The problem is that if a translation is not completed in time, it will be empty string. This means that if a translation is not available, we need to show the English language, and if a translation is available, we need to show the local language.

Since it was difficult to do that in Jekyll, I decided to use Ruby to handle it beforehand. This is done in GitHub Actions. If the keys are translated, they are given priority, if not, the English strings are applied to the keys. As a result, the process on the Jekyll side is simple.

For all displays, we write the following process

{% raw %}
```
{% assign messages = site.data.i18n.faq1 %}
{% include translate.html %}
```
{% endraw %}

It would have been nice to be able to write something like below, but Jekyll doesn't seem to allow us to define variables in included files when using include. So I use `assign` every time.

{% raw %}
```
{% include translate.html messages = site.data.i18n.faq1 %}
```
{% endraw %}

The translation is rendered in parallel as follows. And by default, all `.lang` is hidden.

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

And using JavaScript to recognize the language of the web browser when the website is displayed and reflect it in the display. The language recognition process uses a library called [blang](https://github.com/cupof-github/blang.js).

```js
$('.lang').hide();
if (blang.is.en()) {
  $('.lang.en').show();
} else if (blang.is.ja()) {
  $('.lang.ja').show();
}
// The following is omitted
```

In addition, although we don't see this often in Japan, in some cases, the basic language is English and the local language is set after the second language. In this case, English takes precedence over other languages, and even if the local language is supported, it will not be used. To solve this problem, our system retrieves the languages set in the web browser and notifies the visitor whether to use the local language if it is available.

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

This method is generally fine, but there are a few issues

- Only English is available for OGP (Open Graph Protocol)
- Can't apply multilingual processing to select tag options
- Can't apply multilingual processing to the input placeholders
- The other languages are not well hidden in the Markdown display

There are some problems that haven't been solved, but if we're using Markdown, for example, we can solve them by using JavaScript to render Markdown.

## Easy maintenance

Being a static site and using a Google Sheets makes it much less maintainable. If it's in a table format, we've all had experience editing it. It's a lot easier than creating a dedicated admin screen, and doing all the complicated processes there.

![](/asia-2020/assets/articles/devrel-asia-website-13.png)

Scattered information is the most problematic in this kind of much people work. There are few places to look, and it's recommended to be fixed. In this case, I only use Google Drive and Slack. All of our emails come to Slack, all of our meeting minutes are stored on Google Drive, our CFP votes and social posts are completed on Google Forms.

## Conclusion

I've introduced back stage at DevRel/Asia 2020. Operating serverless frees us from managing servers and allows us to focus on running the conference. With data management and presentation separated, it's also easier to isolate problems as they arise.

I hope you all find it helpful when you're running your own conference or community website!
