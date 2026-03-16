# frozen_string_literal: true

SEED_USERS = [
  { email_address: "dev@example.com", password: "password", password_confirmation: "password" },
  { email_address: "test@example.com", password: "password", password_confirmation: "password" }
].freeze

SEED_USERS.each do |attrs|
  user = User.find_or_initialize_by(email_address: attrs[:email_address])
  if user.new_record?
    user.update!(attrs)
    puts "  Created user: #{user.email_address}"
  else
    puts "  Already exists: #{user.email_address}"
  end
end
