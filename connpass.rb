require 'json'
require 'time'
speakers = {}
JSON.parse(open('_data/sps.json').read).each do |s|
  speakers[s['id']] = s
end
res = ['| 時間 | タイトル | 名前（敬称略）']
res << '|-------|---------|--------|'
sessions = JSON.parse(open('_data/sessions.json').read)
sessions.each do |s|
  next if s['track'] != 'Japan'
  d = Time.parse s['utc']
  d += 9 * 60 * 60
  params = [d.strftime('%H:%M')]
  if s['speaker'] == 'true' && speakers[s['speaker_id']]
    params << "[#{s['title_your_language']}](https://devrel.dev/asia-2020/speakers/#{s['speaker_id']})"  
    sp = ["#{speakers[s['speaker_id']]['name_your_language']}@#{speakers[s['speaker_id']]['company_your_language'].gsub('株式会社', '')}"]
    3.times do |i|
      id = "speaker#{i + 2}_id"
      speaker_id = s[id]
      next if speaker_id == ''
      speaker = speakers[speaker_id]
      if speaker
        sp << "#{speaker['name_your_language']}@#{speaker['company_your_language'].gsub('株式会社', '')}"
      end
    end
    params << sp.join(' / ')
  else
    params << s['title_your_language']
    params << ""
  end
  res << "| #{params.join(" | ")} |"
end

res << ""

puts res.join("\n")

res = ["", '# 登壇内容']
res << ''

sessions.each do |s|
  next if s['track'] != 'Japan'
  d = Time.parse s['utc']
  d += 9 * 60 * 60
  # params = [d.strftime('%H:%M')]
  params = []
  if s['speaker'] == 'true' && speakers[s['speaker_id']]
    params << "## [#{s['title_your_language']}](https://devrel.dev/asia-2020/speakers/#{s['speaker_id']})"
    params << ""
    params << "### 登壇者： #{speakers[s['speaker_id']]['name_your_language']}@#{speakers[s['speaker_id']]['company_your_language'].gsub('株式会社', '')}"
    params << "<img src=\"https://devrel.dev/asia-2020/assets/images/speakers/#{s['speaker_id']}.jpg\" width=\"300px\"/>"
    params << ""
    params << "#{s['description_your_language']}"
    params << ""
    bol = true
    3.times do |i|
      id = "speaker#{i + 2}_id"
      speaker_id = s[id]
      next if speaker_id == ''
      if bol
        params << "パネラー"
        params << ""
        bol = false
      end
      speaker = speakers[speaker_id]
      if speaker
        params << "#### #{speaker['name_your_language']}@#{speaker['company_your_language'].gsub('株式会社', '')}"
        params << "<img src=\"https://devrel.dev/asia-2020/assets/images/speakers/#{speaker['id']}.jpg\" width=\"200px\"/>"
        params << "#{speaker['description_your_language']}"
      end
    end
  else
    params << ""
  end
  params << ""
  res << params.join("\n")
end


puts res.join("\n")
