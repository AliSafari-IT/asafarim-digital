import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ContentTemplate_Key {
  id: UUIDString;
  __typename?: 'ContentTemplate_Key';
}

export interface DesignAsset_Key {
  id: UUIDString;
  __typename?: 'DesignAsset_Key';
}

export interface GeneratedContent_Key {
  id: UUIDString;
  __typename?: 'GeneratedContent_Key';
}

export interface GetDesignAssetByTypeData {
  designAssets: ({
    id: UUIDString;
    name: string;
    category: string;
    exampleImageURL?: string | null;
    codeSnippet?: string | null;
  } & DesignAsset_Key)[];
}

export interface GetDesignAssetByTypeVariables {
  assetType: string;
}

export interface GetUserProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    projectURL?: string | null;
  } & Project_Key)[];
}

export interface ListAllContentTemplatesData {
  contentTemplates: ({
    id: UUIDString;
    name: string;
    type: string;
    description?: string | null;
    createdAt: TimestampString;
  } & ContentTemplate_Key)[];
}

export interface ListRecentGeneratedContentData {
  generatedContents: ({
    id: UUIDString;
    generatedText: string;
    createdAt: TimestampString;
    user?: {
      displayName: string;
    };
      contentTemplate?: {
        name: string;
        type: string;
      };
        projectUsedIn?: {
          name: string;
        };
  } & GeneratedContent_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllContentTemplatesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllContentTemplatesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllContentTemplatesData, undefined>;
  operationName: string;
}
export const listAllContentTemplatesRef: ListAllContentTemplatesRef;

export function listAllContentTemplates(options?: ExecuteQueryOptions): QueryPromise<ListAllContentTemplatesData, undefined>;
export function listAllContentTemplates(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllContentTemplatesData, undefined>;

interface GetUserProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserProjectsData, undefined>;
  operationName: string;
}
export const getUserProjectsRef: GetUserProjectsRef;

export function getUserProjects(options?: ExecuteQueryOptions): QueryPromise<GetUserProjectsData, undefined>;
export function getUserProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProjectsData, undefined>;

interface GetDesignAssetByTypeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDesignAssetByTypeVariables): QueryRef<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDesignAssetByTypeVariables): QueryRef<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;
  operationName: string;
}
export const getDesignAssetByTypeRef: GetDesignAssetByTypeRef;

export function getDesignAssetByType(vars: GetDesignAssetByTypeVariables, options?: ExecuteQueryOptions): QueryPromise<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;
export function getDesignAssetByType(dc: DataConnect, vars: GetDesignAssetByTypeVariables, options?: ExecuteQueryOptions): QueryPromise<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;

interface ListRecentGeneratedContentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRecentGeneratedContentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRecentGeneratedContentData, undefined>;
  operationName: string;
}
export const listRecentGeneratedContentRef: ListRecentGeneratedContentRef;

export function listRecentGeneratedContent(options?: ExecuteQueryOptions): QueryPromise<ListRecentGeneratedContentData, undefined>;
export function listRecentGeneratedContent(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRecentGeneratedContentData, undefined>;

