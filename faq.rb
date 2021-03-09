require('json')
json = JSON.parse(open('./_data/faq.json').read)

results = []
json.each do |faq|
  question = {}
  answer = {}
  question['english'] = faq['question']
  answer['english'] = faq['answer']
  faq.each do |key|
    m = key[0].match(/^question_(.*)$/)
    question[m[1]] = key[1] == '' ? faq['question'] : key[1] if m
    m = key[0].match(/^answer_(.*)$/)
    answer[m[1]] = key[1] == '' ? faq['answer'] : key[1] if m
  end
  results << {
    question: question,
    answer: answer
  }  
end
f = open("./_data/qa.json", 'w')
f.write(results.to_json)
f.close
