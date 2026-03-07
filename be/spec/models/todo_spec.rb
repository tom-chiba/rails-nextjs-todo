require "rails_helper"

RSpec.describe Todo do
  describe "associations" do
    it "belongs to a user" do
      todo = create(:todo)
      expect(todo.user).to be_a(User)
    end

    it "is invalid without a user" do
      todo = build(:todo, user: nil)
      expect(todo).not_to be_valid
      expect(todo.errors[:user]).to include("must exist")
    end
  end

  describe "validations" do
    it "is valid with text" do
      todo = build(:todo)
      expect(todo).to be_valid
    end

    it "is invalid without text" do
      todo = build(:todo, text: nil)
      expect(todo).not_to be_valid
      expect(todo.errors[:text]).to include("can't be blank")
    end

    it "is invalid with blank text" do
      todo = build(:todo, text: "")
      expect(todo).not_to be_valid
    end
  end

  describe "defaults" do
    it "defaults completed to false" do
      todo = create(:todo)
      expect(todo.completed).to be false
    end
  end

  describe "image" do
    let(:jpeg_header) { "\xFF\xD8\xFF\xE0".b + ("\x00" * 100).b }

    it "is valid without an image" do
      todo = build(:todo)
      expect(todo).to be_valid
    end

    it "is valid with a JPEG image" do
      todo = create(:todo)
      todo.image.attach(
        io: StringIO.new(jpeg_header),
        filename: "test.jpg",
        content_type: "image/jpeg"
      )
      expect(todo).to be_valid
    end

    it "is invalid with a non-image file" do
      todo = create(:todo)
      todo.image.attach(
        io: StringIO.new("This is not an image"),
        filename: "test.txt",
        content_type: "text/plain"
      )
      expect(todo).not_to be_valid
      expect(todo.errors[:image]).to include("must be a JPEG, PNG, GIF, or WebP")
    end

    it "rejects a file with spoofed content_type" do
      todo = create(:todo)
      todo.image.attach(
        io: StringIO.new("This is not an image"),
        filename: "evil.jpg",
        content_type: "image/jpeg"
      )
      expect(todo).not_to be_valid
      expect(todo.errors[:image]).to include("must be a JPEG, PNG, GIF, or WebP")
    end

    it "is invalid with an oversized image" do
      todo = create(:todo)
      todo.image.attach(
        io: StringIO.new(jpeg_header + ("x" * 5.megabytes).b),
        filename: "large.jpg",
        content_type: "image/jpeg"
      )
      expect(todo).not_to be_valid
      expect(todo.errors[:image]).to include("is too large (maximum is 5MB)")
    end

    it "returns nil image_url when no image attached" do
      todo = create(:todo)
      expect(todo.image_url).to be_nil
    end

    it "returns image_url when image is attached" do
      todo = create(:todo)
      todo.image.attach(
        io: StringIO.new(jpeg_header),
        filename: "test.jpg",
        content_type: "image/jpeg"
      )
      expect(todo.image_url).to be_present
    end

    it "includes image_url in JSON" do
      todo = create(:todo)
      json = todo.as_json
      expect(json).to have_key("image_url")
      expect(json["image_url"]).to be_nil
    end
  end
end
