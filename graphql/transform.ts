export type GraphqlReady<Entity extends { id: number }> = Omit<
  {
    [Key in keyof Entity]: Entity[Key] extends Date ? string : Entity[Key];
  },
  'id'
> & { id: string };

type PostgresToGraphqlResult<Entity extends { id: number } | undefined> =
  Entity extends { id: number } ? GraphqlReady<Entity> : null;

/**
 * Converts a Postgres row object into a GraphQL-friendly object shape and
 * returns `null` when the input row is `undefined`
 *
 * - Converts `undefined` input to `null`
 * - Converts `id` from `number` to `string`
 * - Converts top-level `Date` values to ISO `string` values
 */
export function postgresToGraphql<Entity extends { id: number } | undefined>(
  entity: Entity,
): PostgresToGraphqlResult<Entity> {
  if (!entity) return null as PostgresToGraphqlResult<Entity>;

  const convertedEntity: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(
    entity as Record<string, unknown>,
  )) {
    convertedEntity[key] = value instanceof Date ? value.toISOString() : value;
  }
  convertedEntity.id = String(entity.id);

  return convertedEntity as PostgresToGraphqlResult<Entity>;
}
