// types/lab.ts

export interface LabForm {
  lab_id: number | null;
  name: string;
  location: string;
  lab_image: string;
  safety_equipments: string;
  safety_notes: string;
  [key: string]: string | number | null; // 添加索引签名
}

export interface Lab {
  id: number;
  name: string;
  location: string;
  lab_image: string;
  safety_equipments: string;
  safety_notes: string;
}

export interface LabResponse {
  success: boolean;
  data: Lab | Lab[];
  error?: string;
}

export interface EditingField {
  [key: string]: boolean;
}

export interface EditForm {
  [key: string]: string | number | null;
}
