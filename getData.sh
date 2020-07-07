wget -O _data/organizers.json https://script.google.com/macros/s/AKfycbzZNpbhSOxRoGF6GTl8KpmyvvuYg-8f4o7lNM3CLpfmEWYutO1Z/exec?name=organizers
wget -O _data/faq.json https://script.google.com/macros/s/AKfycbzZNpbhSOxRoGF6GTl8KpmyvvuYg-8f4o7lNM3CLpfmEWYutO1Z/exec?name=faq
wget -O _data/translates.json https://script.google.com/macros/s/AKfycbzZNpbhSOxRoGF6GTl8KpmyvvuYg-8f4o7lNM3CLpfmEWYutO1Z/exec?name=translates
ruby organizer.rb
ruby translate.rb 
ruby faq.rb 
