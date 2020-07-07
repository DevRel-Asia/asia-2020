require('json')
json = JSON.parse(open('./_data/organizers.json').read)

results = []
countries = %w(english japan korea singapore hongkong india)
json.each do |org|
  %w(company title name profile).each do |type|
    org[type] = {}
    countries.each do |country|
      org[type][country] = org["#{type}_english"]
    end
    org[type]['japan'] = org["#{type}_your_language"] if org['profile_language'] == 'Japanese'
    org[type]['korea'] = org["#{type}_your_language"] if org['profile_language'] == 'Korean'
    org[type]['india'] = org["#{type}_your_language"] if org['profile_language'] == 'Hindi'
  end
  results << org
  content = <<-EOS
---
layout: organizer
permalink: /organizers/#{org['id']}/
id: #{org['id']}
speaker: #{org['name_english']}#{org['company_english'] == '' ? '' : "（#{org['company_english']}）"}
---
  EOS
  f = open("./organizers/#{org['id']}.md", 'w')
  f.write(content)
  f.close
end

f = open("./_data/orgs.json", 'w')
f.write(results.to_json)
f.close

