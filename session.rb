require 'json'
require 'time'

files = [
  'asia2',
  'japan',
  'korea',
  'asia1',
  'sea',
  'china'
]

sessions = []
files.each do |file_name|
  path = "./_data/session_#{file_name}.json"
  next unless File.exist? path
  json = JSON.parse(open(path).read)
  results = []
  countries = %w(english japan korea singapore vietnam indonesia)
  json.each do |session|
    next if session['id'] == ''
    d = Time.parse session['utc']
    session['start'] = d.strftime('%H:%M')
    r = Time.parse session['range']
    time = 0
    if r.strftime('%H').to_i > 0
      time = r.strftime('%H').to_i * 60 * 60
    end
    if r.strftime('%M').to_i > 0
      time = time + r.strftime('%M').to_i * 60
    end
    session['end' ] = (d + time).strftime('%H:%M')
    %w(title description category).each do |type|
      session[type] = {}
      countries.each do |country|
        session[type][country] = session["#{type}_english"]
      end
      session[type]['japan'] = session["#{type}_your_language"] if session['language'].upcase == 'JAPANESE'
      session[type]['korea'] = session["#{type}_your_language"] if session['language'].upcase == 'KOREAN'
      session[type]['india'] = session["#{type}_your_language"] if session['language'].upcase == 'HINDI'
      session[type]['china'] = session["#{type}_your_language"] if session['language'].upcase == 'CHINESE'
    end
    results << session
    session['track'] = file_name.capitalize
    sessions << session
  end
  f = open(path, 'w')
  f.write(results.to_json)
  f.close
end

f = open('./_data/sessions.json', 'w')
f.write(sessions.to_json)
f.close
