// types/lab.ts

export interface LabForm {
  lab_id: number | null;
  name: string;
  location: string;
  lab_image: string;
  map_image: string;
  safety_equipments: string;
  safety_notes: string;
  [key: string]: string | number | null; // 添加索引签名
}
export interface Equipment {
  name: string;
  description: string;
  image?: string; // base64 string
  isEditing?: boolean;
}
export interface Lab {
  id: number;
  name: string;
  location: string;
  lab_image: string;
  map_image: string;
  safety_equipments: string;
  safety_notes: string;
}

export interface LabResponse {
  success: boolean;
  data: Lab | Lab[];
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}
export interface EditingField {
  [key: string]: boolean;
}

export interface EditForm {
  [key: string]: string | number | null;
}

export interface LabManager {
  manager_user_id: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  lab_id: number;
}

export interface BindManagerRequest {
  manager_user_id: string;
  lab_id: number;
}

export interface ManagerResponse {
  success: boolean;
  data?: LabManager | LabManager[];
  error?: string;
}
export interface UpdateLabRequest {
  name?: string;
  location?: string;
  safety_equipments?: string;
  safety_notes?: string;
  // ... 其他可更新的字段
}
