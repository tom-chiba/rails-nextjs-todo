require "rails_helper"

RSpec.describe "Api::V1::Todos" do
  let(:user) { create(:user) }

  context "when authenticated" do
    before { sign_in(user) }

    describe "GET /api/v1/todos" do
      it "returns only the current user's todos" do
        create_list(:todo, 3, user: user)
        create_list(:todo, 2, user: create(:user))

        get api_v1_todos_path
        expect(response).to have_http_status(:ok)

        json = response.parsed_body
        expect(json.size).to eq(3)
      end

      it "returns todos ordered by created_at desc" do
        create(:todo, text: "First", user: user)
        create(:todo, text: "Second", user: user)

        get api_v1_todos_path

        json = response.parsed_body
        timestamps = json.map { |t| t["created_at"] }
        expect(timestamps).to eq(timestamps.sort.reverse)
      end
    end

    describe "POST /api/v1/todos" do
      it "creates a todo associated with the current user" do
        expect {
          post api_v1_todos_path, params: { todo: { text: "New todo" } }, as: :json
        }.to change(Todo, :count).by(1)

        expect(response).to have_http_status(:created)

        json = response.parsed_body
        expect(json["text"]).to eq("New todo")
        expect(json["completed"]).to be false
        expect(Todo.last.user).to eq(user)
      end

      it "returns errors with invalid params" do
        expect {
          post api_v1_todos_path, params: { todo: { text: "" } }, as: :json
        }.not_to change(Todo, :count)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    describe "PATCH /api/v1/todos/:id" do
      let(:todo) { create(:todo, user: user) }

      it "toggles completed" do
        patch api_v1_todo_path(todo), params: { todo: { completed: true } }, as: :json
        expect(response).to have_http_status(:ok)

        json = response.parsed_body
        expect(json["completed"]).to be true
        expect(todo.reload.completed).to be true
      end

      it "changes text" do
        patch api_v1_todo_path(todo), params: { todo: { text: "Updated text" } }, as: :json
        expect(response).to have_http_status(:ok)

        expect(todo.reload.text).to eq("Updated text")
      end

      it "returns not found for nonexistent todo" do
        patch api_v1_todo_path(id: 999999), params: { todo: { completed: true } }, as: :json
        expect(response).to have_http_status(:not_found)
      end

      it "returns not found for another user's todo" do
        other_todo = create(:todo, user: create(:user))
        patch api_v1_todo_path(other_todo), params: { todo: { completed: true } }, as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "DELETE /api/v1/todos/bulk_destroy" do
      it "destroys all specified todos" do
        todos = create_list(:todo, 3, user: user)

        expect {
          delete bulk_destroy_api_v1_todos_path, params: { ids: todos.map(&:id) }, as: :json
        }.to change(Todo, :count).by(-3)

        expect(response).to have_http_status(:no_content)
      end

      it "does not destroy other user's todos" do
        own_todo = create(:todo, user: user)
        other_todo = create(:todo, user: create(:user))

        expect {
          delete bulk_destroy_api_v1_todos_path, params: { ids: [ own_todo.id, other_todo.id ] }, as: :json
        }.to change(Todo, :count).by(-1)

        expect(response).to have_http_status(:no_content)
        expect(Todo.exists?(other_todo.id)).to be true
      end
    end

    describe "DELETE /api/v1/todos/:id" do
      it "destroys the todo" do
        todo = create(:todo, user: user)

        expect {
          delete api_v1_todo_path(todo), as: :json
        }.to change(Todo, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns not found for another user's todo" do
        other_todo = create(:todo, user: create(:user))

        expect {
          delete api_v1_todo_path(other_todo), as: :json
        }.not_to change(Todo, :count)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  context "when not authenticated" do
    it "returns unauthorized for index" do
      get api_v1_todos_path
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized for create" do
      post api_v1_todos_path, params: { todo: { text: "Test" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized for update" do
      todo = create(:todo)
      patch api_v1_todo_path(todo), params: { todo: { completed: true } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized for destroy" do
      todo = create(:todo)
      delete api_v1_todo_path(todo), as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns unauthorized for bulk_destroy" do
      delete bulk_destroy_api_v1_todos_path, params: { ids: [ 1 ] }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
