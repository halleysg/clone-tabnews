import session from "models/session";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("Witch incorrect `email` but correct `password`", async () => {
      const passwordTest = "senhacorreta";

      await orchestrator.createUser({
        password: passwordTest,
      });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@curso.dev",
          password: passwordTest,
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique se as credenciais enviadas estão corretas.",
        status_code: 401,
      });
    });

    test("Witch incorrect `password` but correct `email`", async () => {
      const emailTest = "emai.correto@curso.dev";

      await orchestrator.createUser({
        email: emailTest,
      });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailTest,
          password: "senhaerrada",
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique se as credenciais enviadas estão corretas.",
        status_code: 401,
      });
    });

    test("Witch incorrect `password` and `email`", async () => {
      await orchestrator.createUser({});

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailerrado@test.com",
          password: "senhaerrada",
        }),
      });

      expect(res.status).toBe(401);

      const resBody = await res.json();

      expect(resBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação inválidos",
        action: "Verifique se as credenciais enviadas estão corretas.",
        status_code: 401,
      });
    });

    test("Witch correct `password` and `email`", async () => {
      const correctEmail = "correto@test.com";
      const correctPassword = "senhaCorreta";

      const createdUser = await orchestrator.createUser({
        email: correctEmail,
        password: correctPassword,
      });

      const res = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correctEmail,
          password: correctPassword,
        }),
      });

      expect(res.status).toBe(201);

      const resBody = await res.json();

      expect(resBody).toEqual({
        id: resBody.id,
        token: resBody.token,
        user_id: createdUser.id,
        expires_at: resBody.expires_at,
        created_at: resBody.created_at,
        updated_at: resBody.updated_at,
      });

      expect(uuidVersion(resBody.id)).toBe(4);
      expect(Date.parse(resBody.expires_at)).not.toBeNaN();
      expect(Date.parse(resBody.created_at)).not.toBeNaN();
      expect(Date.parse(resBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(resBody.expires_at).setMilliseconds(0);
      const createdAt = new Date(resBody.created_at).setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(res, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: resBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
