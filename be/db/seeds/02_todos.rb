# frozen_string_literal: true

dev_user = User.find_by!(email_address: "dev@example.com")

SEED_TODOS = [
  { text: "牛乳を買う", completed: false },
  { text: "メールに返信する", completed: true },
  { text: "レポートを書く", completed: false },
  { text: "部屋を掃除する", completed: true },
  { text: "ランニングをする", completed: false }
].freeze

SEED_TODOS.each do |attrs|
  todo = dev_user.todos.find_or_initialize_by(text: attrs[:text])
  if todo.new_record?
    todo.update!(attrs)
    puts "  Created todo: #{todo.text}"
  else
    puts "  Already exists: #{todo.text}"
  end
end
