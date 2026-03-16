# frozen_string_literal: true

# Seeds are development-only. Abort if accidentally run in production.
if Rails.env.production?
  abort "Seeds are not intended for production. Aborting."
end

# Load all seed files from db/seeds/ directory in sorted order.
# To add seeds for a new model, simply create a new file in db/seeds/.
Dir[Rails.root.join("db/seeds/*.rb")].sort.each do |seed_file|
  puts "Loading #{File.basename(seed_file)}..."
  load seed_file
end

puts "Seed complete!"
