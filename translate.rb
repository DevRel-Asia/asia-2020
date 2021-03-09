require('json')
json = JSON.parse(open('./_data/translates.json').read)

translates = {}
json.each do |translate|
  translates[translate['key']] = {}
  translate.each do |natinality, str|
    next if natinality == 'key'
    translates[translate['key']][natinality] = str == "" ? translate['english'] : str
  end
end
f = open("./_data/i18n.json", 'w')
f.write(translates.to_json)
f.close
