import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { randomBytes, scrypt } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

export default async function createAdminUser({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const email = process.env.ADMIN_EMAIL || "admin@medusa.local"
  const password = process.env.ADMIN_PASSWORD || "supersecret"
  const firstName = process.env.ADMIN_FIRST_NAME || "Admin"
  const lastName = process.env.ADMIN_LAST_NAME || "User"

  logger.info(`Creating admin user: ${email}`)

  const userModule = container.resolve(Modules.USER)
  const authModule = container.resolve(Modules.AUTH)

  const existing = await userModule.listUsers({ email })
  if (existing.length > 0) {
    logger.info(`Admin user ${email} already exists, skipping.`)
    return
  }

  const [user] = await userModule.createUsers([
    { email, first_name: firstName, last_name: lastName },
  ])

  await authModule.createAuthIdentities([
    {
      provider_identities: [
        {
          provider: "emailpass",
          entity_id: email,
          provider_metadata: { password: await hashPassword(password) },
        },
      ],
      app_metadata: { user_id: user.id },
    },
  ])

  logger.info(`Admin user ${email} created successfully.`)
}
