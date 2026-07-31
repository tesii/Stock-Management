export interface Audit {

  id: number;

  username: string;

  role: string;

  action: string;

  entityName: string;

  entityId: number;

  description: string;

  createdAt: string;

}