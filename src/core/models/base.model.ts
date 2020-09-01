import {
  getConnection,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  getManager,
  EntityManager,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class BaseModel {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column("timestamp")
  created: Date = new Date();

  @Column("timestamp", { nullable: true })
  updated: Date | null = null;

  @BeforeUpdate()
  setUpdated() {
    this.updated = new Date();
  }

  @Column("boolean", { default: false })
  deleted: boolean = false;

  public static getRelations(): IRelationDefinition[] {
    return getConnection()
      .getMetadata(this)
      .relations.map((r) => ({
        name: r.propertyName,
        model: <typeof BaseModel>r.type,
      }));
  }

  public static async create(
    entity: Partial<BaseModel>,
    em?: EntityManager
  ): Promise<BaseModel> {
    const inserted = await (em ?? getManager()).save(entity);
    return <BaseModel>inserted;
  }

  

  public static getIdPropertyName(): string {
    return getConnection().getMetadata(this).primaryColumns[0].propertyName;
  }
  public static getIdDatabaseName(): string {
    return getConnection().getMetadata(this).primaryColumns[0].databaseName;
  }
}

export interface IRelationDefinition {
  name: string;
  model: typeof BaseModel;
}

export type CreateInput<T extends BaseModel> = Omit<
  T,
  "id" | "created" | "updated" | "deleted"
>;

export type PatchInput<T extends BaseModel> = Pick<T, "id"> & Partial<T>;
