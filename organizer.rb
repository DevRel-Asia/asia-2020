require('json')
json = JSON.parse(open('./_data/organizers.json').read)

json.each do |session|
  content = <<-EOS
---
layout: organizer
permalink: /organizers/#{session['id']}/
id: #{session['id']}
speaker: #{session['name_english']}#{session['company_english'] == '' ? '' : "（#{session['company_english']}）"}
---
  EOS
  f = open("./organizers/#{session['id']}.md", 'w')
  f.write(content)
  f.close
end
