require 'json'
require 'time'
require 'uri'
speakers = {}
JSON.parse(open('_data/sps.json').read).each do |s|
  speakers[s['id']] = s
end
sessions = JSON.parse(open('_data/sessions.json').read)
sessions.each do |session|
  next if session['speaker'] != 'true'
  params = {}
  d = Time.parse session['utc']
  params['time'] = d.strftime('%H:%M')
  params['id'] = session['speaker_id']
  params['track'] = session['track']
  speaker = speakers[session['speaker_id']]
  if session['speaker'] == 'true' && speaker
    params['name'] = speaker['name_your_language'] == '' ? speaker['name']['english'] : speaker['name_your_language']
    params['company'] = speaker['company_your_language'] == '' ? speaker['company']['english'] : speaker['company_your_language']
    params['title'] = session['title_your_language'] == '' ? session['title']['english'] : session['title_your_language']
  end
  query = params.map.each do |k, v|
    "#{k}=#{URI.encode v}"
  end.join('&')
  puts "http://127.0.0.1:4000/asia-2020/interlude.html?#{query}"
end
