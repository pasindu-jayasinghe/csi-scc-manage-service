

export abstract class BulckUpdatable{
  abstract bulkCalculate(unitIds: number[], projectId: number);
  abstract bulkDelete(ids: number[], isPermant: boolean);
}