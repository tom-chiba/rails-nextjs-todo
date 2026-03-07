class Todo < ApplicationRecord
  belongs_to :user

  has_one_attached :image

  validates :text, presence: true
  validate :acceptable_image

  ALLOWED_IMAGE_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze
  MAX_IMAGE_SIZE = 5.megabytes

  def image_url
    return nil unless image.attached?

    Rails.application.routes.url_helpers.rails_blob_url(image)
  end

  def as_json(options = {})
    super(options.merge(
      methods: Array(options[:methods]) | [ :image_url ]
    ))
  end

  private

  def acceptable_image
    return unless image.attached?

    io, byte_size = image_io_and_size
    io.rewind
    detected = Marcel::MimeType.for(io.read(4096))
    io.rewind

    unless detected.in?(ALLOWED_IMAGE_TYPES)
      errors.add(:image, "must be a JPEG, PNG, GIF, or WebP")
    end

    if byte_size > MAX_IMAGE_SIZE
      errors.add(:image, "is too large (maximum is 5MB)")
    end
  end

  def image_io_and_size
    change = attachment_changes["image"]
    if change.is_a?(ActiveStorage::Attached::Changes::CreateOne)
      attachable = change.attachable
      io = attachable.respond_to?(:read) ? attachable : attachable[:io]
      [ io, io.size ]
    else
      io = StringIO.new
      image.blob.open do |tempfile|
        io.write(tempfile.read(4096))
      end
      io.rewind
      [ io, image.byte_size ]
    end
  end
end
