require('json')
json = JSON.parse(open('./_data/speakers.json').read)

results = []
countries = %w(english japan korea singapore vietnam indonesia)
json.each do |speaker|
  %w(company speaker_title name profile).each do |type|
    speaker[type] = {}
    countries.each do |country|
      speaker[type][country] = speaker["#{type}_english"]
    end
    if speaker["#{type}_your_language"] != ""
      speaker[type][speaker["profile_country"]] = speaker["#{type}_your_language"]
    end
  end
  results << speaker
  content = <<-EOS
---
layout: speaker
permalink: /speakers/#{speaker['id']}/
id: #{speaker['id']}
type: speaker
title: #{speaker['name_english']}#{speaker['company_english'] == '' ? '' : "（#{speaker['company_english']}）"}
---
  EOS
  f = open("./speakers/#{speaker['id']}.md", 'w')
  f.write(content)
  f.close
end

f = open("./_data/sps.json", 'w')
f.write(results.to_json)
f.close

