class Todo < ApplicationRecord
  belongs_to :user

  has_one_attached :image

  validates :text, presence: true
  validate :acceptable_image

  ALLOWED_IMAGE_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze
  MAX_IMAGE_SIZE = 5.megabytes

  def image_url
    return nil unless image.attached?

    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  end

  def as_json(options = {})
    super(options.merge(methods: :image_url, except: []))
  end

  private

  def acceptable_image
    return unless image.attached?

    unless image.content_type.in?(ALLOWED_IMAGE_TYPES)
      errors.add(:image, "must be a JPEG, PNG, GIF, or WebP")
    end

    if image.byte_size > MAX_IMAGE_SIZE
      errors.add(:image, "is too large (maximum is 5MB)")
    end
  end
end
