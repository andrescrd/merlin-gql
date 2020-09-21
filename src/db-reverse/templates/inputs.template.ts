import { Column } from "../models/column";
import IGenerationOptions from "../options/generation-options.interface";
import {
  toEntityFileName,
  toEntityName,
  toInputsName,
  toPropertyName,
} from "./../generation/model-generation";

const defaultValueIfNeeded = (nullable: boolean, tscType: string) => {
  if (nullable) {
    return "";
  } else if (!nullable && tscType === "string") {
    return ' = ""';
  } else if (!nullable && tscType === "number") {
    return " = 0";
  } else if (!nullable && tscType === "Date") {
    return " = new Date()";
  } else if (!nullable && tscType === "boolean") {
    return " = false";
  }
};

const ColumnTemplate = (
  column: Column,
  generationOptions: IGenerationOptions
) => {
  const fieldNullable = column.options.nullable ? `{ nullable: true }` : "";
  const propertyName = toPropertyName(column.tscName, generationOptions);
  const questionMarkIfNullable = column.options.nullable ? "?" : "";
  const defaultValue = defaultValueIfNeeded(
    !!column.options.nullable,
    column.tscType
  );
  return `
        @Field(${fieldNullable})
        ${propertyName}${questionMarkIfNullable}:${column.tscType}${defaultValue};
        `;
};
// prettier-ignore
export const InputsTemplate = (
    tscName: string,
    columns: Column[],
    generationOptions: IGenerationOptions
  ): string => {
      
      const entityName:string = toEntityName(tscName, generationOptions)
      const entityFileName:string = toEntityFileName(tscName, generationOptions)
      const inputsName:string = toInputsName(tscName, generationOptions);
      return `
      
      import {InputType,Field} from "type-graphql";
      import { BaseInputFields } from 'merlin-gql';
      import { ${entityName} } from "./${entityFileName}";
      
      @InputType()
      export class ${inputsName} extends BaseInputFields implements Partial<${entityName}> {
        ${columns.filter(c => !c.generated).map(c => ColumnTemplate(c, generationOptions)).join("\n")}
      }
      `
  }
