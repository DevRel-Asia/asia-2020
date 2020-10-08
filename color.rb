require 'json'

path = "./_data/colors.json"
json = JSON.parse(open(path).read)
results = [':root {']
styles = []
json.each_with_index do |color, i|
  results << "  --cd-color-event-#{i + 1}: hsl(#{color['H']}, #{color['S']}%, #{color['L']}%);"
  results << "  --cd-color-event-#{i + 1}-h: #{color['H']};"
  results << "  --cd-color-event-#{i + 1}-s: #{color['S']}%;"
  results << "  --cd-color-event-#{i + 1}-l: #{color['L']}%;"

  styles << <<-EOF
  .cd-schedule__event [data-event="event-#{i + 1}"], .cd-schedule-modal[data-event="event-#{i + 1}"] .cd-schedule-modal__header-bg {
    background: hsl(#{color['H']}, #{color['S']}%, #{color['L']}%);
    background: var(--cd-color-event-#{i + 1})
  }
  EOF
end
results << '}'


f = open('assets/css/color.css', 'w')
f.write results.join("\n") + "\n" + styles.join("\n")
f.close
