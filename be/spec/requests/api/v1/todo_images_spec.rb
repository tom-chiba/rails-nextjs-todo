require "rails_helper"

RSpec.describe "Api::V1::TodoImages", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:todo) { create(:todo, user: user) }
  let(:valid_image) { fixture_file_upload("test.jpg", "image/jpeg") }
  let(:invalid_image) { fixture_file_upload("test.txt", "text/plain") }

  before { sign_in(user) }

  describe "POST /api/v1/todos/:todo_id/image" do
    it "uploads an image to a todo" do
      post api_v1_todo_image_path(todo), params: { image: valid_image }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["image_url"]).to be_present
      expect(todo.reload.image).to be_attached
    end

    it "returns errors for invalid file type" do
      post api_v1_todo_image_path(todo), params: { image: invalid_image }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body).to have_key("errors")
      expect(todo.reload.image).not_to be_attached
    end

    it "replaces an existing image" do
      todo.image.attach(
        io: StringIO.new("\xFF\xD8\xFF\xE0".b + ("\x00" * 100).b),
        filename: "old.jpg",
        content_type: "image/jpeg"
      )

      post api_v1_todo_image_path(todo), params: { image: valid_image }

      expect(response).to have_http_status(:ok)
      expect(todo.reload.image.filename.to_s).to eq("test.jpg")
    end

    it "returns not found for another user's todo" do
      other_todo = create(:todo, user: other_user)

      post api_v1_todo_image_path(other_todo), params: { image: valid_image }

      expect(response).to have_http_status(:not_found)
    end

    it "returns unauthorized when not authenticated" do
      delete api_v1_auth_sign_out_path
      post api_v1_todo_image_path(todo), params: { image: valid_image }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/todos/:todo_id/image" do
    it "deletes the image from a todo" do
      todo.image.attach(
        io: StringIO.new("\xFF\xD8\xFF\xE0".b + ("\x00" * 100).b),
        filename: "test.jpg",
        content_type: "image/jpeg"
      )

      delete api_v1_todo_image_path(todo)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["image_url"]).to be_nil
      expect(todo.reload.image).not_to be_attached
    end

    it "returns not found when no image attached" do
      delete api_v1_todo_image_path(todo)

      expect(response).to have_http_status(:not_found)
    end

    it "returns not found for another user's todo" do
      other_todo = create(:todo, user: other_user)

      delete api_v1_todo_image_path(other_todo)

      expect(response).to have_http_status(:not_found)
    end

    it "returns unauthorized when not authenticated" do
      delete api_v1_auth_sign_out_path
      delete api_v1_todo_image_path(todo)

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
