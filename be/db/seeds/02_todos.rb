# frozen_string_literal: true

dev_user = User.find_by!(email_address: "dev@example.com")

SEED_TODOS = [
  { text: "牛乳を買う", completed: false, image: "milk.png" },
  { text: "メールに返信する", completed: true },
  { text: "レポートを書く", completed: false },
  { text: "部屋を掃除する", completed: true },
  { text: "ランニングをする", completed: false }
].freeze

SEED_TODOS.each do |attrs|
  image_filename = attrs.delete(:image)
  todo = dev_user.todos.find_or_initialize_by(text: attrs[:text])
  if todo.new_record?
    todo.update!(attrs)
    puts "  Created todo: #{todo.text}"
  else
    puts "  Already exists: #{todo.text}"
  end

  if image_filename && !todo.image.attached?
    image_path = Rails.root.join("db/seeds/fixtures", image_filename)
    todo.image.attach(
      io: File.open(image_path),
      filename: image_filename,
      content_type: Marcel::MimeType.for(name: image_filename)
    )
    puts "  Attached image: #{image_filename} -> #{todo.text}"
  end
end
