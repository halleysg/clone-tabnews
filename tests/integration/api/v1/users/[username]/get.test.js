import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const username = "mesmoCase";
      const email = "mesmo.case@teste.com";

      await orchestrator.createUser({
        username,
        email,
        password: "123",
      });

      const res = await fetch(`http://localhost:3000/api/v1/users/${username}`);

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username,
        email,
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const username = "caseDiferente";
      const email = "case.diferente@teste.com";

      await orchestrator.createUser({
        username,
        email,
        password: "abc",
      });

      const res = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(res.status).toBe(200);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        username,
        email,
        password: resBody.password,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const res = await fetch(
        "http://localhost:3000/api/v1/users/usuarioInexistente",
      );

      expect(res.status).toBe(404);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
