import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação inválidos",
        action: "Verifique se as credenciais enviadas estão corretas.",
      });
    }

    throw e;
  }

  async function findUserByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email inválido",
        });
      }

      throw e;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha inválida",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
