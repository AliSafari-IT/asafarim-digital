# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllContentTemplates*](#listallcontenttemplates)
  - [*GetUserProjects*](#getuserprojects)
  - [*GetDesignAssetByType*](#getdesignassetbytype)
  - [*ListRecentGeneratedContent*](#listrecentgeneratedcontent)
- [**Mutations**](#mutations)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllContentTemplates
You can execute the `ListAllContentTemplates` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllContentTemplates(options?: ExecuteQueryOptions): QueryPromise<ListAllContentTemplatesData, undefined>;

interface ListAllContentTemplatesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllContentTemplatesData, undefined>;
}
export const listAllContentTemplatesRef: ListAllContentTemplatesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllContentTemplates(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllContentTemplatesData, undefined>;

interface ListAllContentTemplatesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllContentTemplatesData, undefined>;
}
export const listAllContentTemplatesRef: ListAllContentTemplatesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllContentTemplatesRef:
```typescript
const name = listAllContentTemplatesRef.operationName;
console.log(name);
```

### Variables
The `ListAllContentTemplates` query has no variables.
### Return Type
Recall that executing the `ListAllContentTemplates` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllContentTemplatesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllContentTemplatesData {
  contentTemplates: ({
    id: UUIDString;
    name: string;
    type: string;
    description?: string | null;
    createdAt: TimestampString;
  } & ContentTemplate_Key)[];
}
```
### Using `ListAllContentTemplates`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllContentTemplates } from '@dataconnect/generated';


// Call the `listAllContentTemplates()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllContentTemplates();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllContentTemplates(dataConnect);

console.log(data.contentTemplates);

// Or, you can use the `Promise` API.
listAllContentTemplates().then((response) => {
  const data = response.data;
  console.log(data.contentTemplates);
});
```

### Using `ListAllContentTemplates`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllContentTemplatesRef } from '@dataconnect/generated';


// Call the `listAllContentTemplatesRef()` function to get a reference to the query.
const ref = listAllContentTemplatesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllContentTemplatesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.contentTemplates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.contentTemplates);
});
```

## GetUserProjects
You can execute the `GetUserProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserProjects(options?: ExecuteQueryOptions): QueryPromise<GetUserProjectsData, undefined>;

interface GetUserProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProjectsData, undefined>;
}
export const getUserProjectsRef: GetUserProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProjectsData, undefined>;

interface GetUserProjectsRef {
  ...
  (dc: DataConnect): QueryRef<GetUserProjectsData, undefined>;
}
export const getUserProjectsRef: GetUserProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProjectsRef:
```typescript
const name = getUserProjectsRef.operationName;
console.log(name);
```

### Variables
The `GetUserProjects` query has no variables.
### Return Type
Recall that executing the `GetUserProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProjectsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    projectURL?: string | null;
  } & Project_Key)[];
}
```
### Using `GetUserProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProjects } from '@dataconnect/generated';


// Call the `getUserProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProjects();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProjects(dataConnect);

console.log(data.projects);

// Or, you can use the `Promise` API.
getUserProjects().then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `GetUserProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProjectsRef } from '@dataconnect/generated';


// Call the `getUserProjectsRef()` function to get a reference to the query.
const ref = getUserProjectsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProjectsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## GetDesignAssetByType
You can execute the `GetDesignAssetByType` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDesignAssetByType(vars: GetDesignAssetByTypeVariables, options?: ExecuteQueryOptions): QueryPromise<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;

interface GetDesignAssetByTypeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDesignAssetByTypeVariables): QueryRef<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;
}
export const getDesignAssetByTypeRef: GetDesignAssetByTypeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDesignAssetByType(dc: DataConnect, vars: GetDesignAssetByTypeVariables, options?: ExecuteQueryOptions): QueryPromise<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;

interface GetDesignAssetByTypeRef {
  ...
  (dc: DataConnect, vars: GetDesignAssetByTypeVariables): QueryRef<GetDesignAssetByTypeData, GetDesignAssetByTypeVariables>;
}
export const getDesignAssetByTypeRef: GetDesignAssetByTypeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDesignAssetByTypeRef:
```typescript
const name = getDesignAssetByTypeRef.operationName;
console.log(name);
```

### Variables
The `GetDesignAssetByType` query requires an argument of type `GetDesignAssetByTypeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDesignAssetByTypeVariables {
  assetType: string;
}
```
### Return Type
Recall that executing the `GetDesignAssetByType` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDesignAssetByTypeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDesignAssetByTypeData {
  designAssets: ({
    id: UUIDString;
    name: string;
    category: string;
    exampleImageURL?: string | null;
    codeSnippet?: string | null;
  } & DesignAsset_Key)[];
}
```
### Using `GetDesignAssetByType`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDesignAssetByType, GetDesignAssetByTypeVariables } from '@dataconnect/generated';

// The `GetDesignAssetByType` query requires an argument of type `GetDesignAssetByTypeVariables`:
const getDesignAssetByTypeVars: GetDesignAssetByTypeVariables = {
  assetType: ..., 
};

// Call the `getDesignAssetByType()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDesignAssetByType(getDesignAssetByTypeVars);
// Variables can be defined inline as well.
const { data } = await getDesignAssetByType({ assetType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDesignAssetByType(dataConnect, getDesignAssetByTypeVars);

console.log(data.designAssets);

// Or, you can use the `Promise` API.
getDesignAssetByType(getDesignAssetByTypeVars).then((response) => {
  const data = response.data;
  console.log(data.designAssets);
});
```

### Using `GetDesignAssetByType`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDesignAssetByTypeRef, GetDesignAssetByTypeVariables } from '@dataconnect/generated';

// The `GetDesignAssetByType` query requires an argument of type `GetDesignAssetByTypeVariables`:
const getDesignAssetByTypeVars: GetDesignAssetByTypeVariables = {
  assetType: ..., 
};

// Call the `getDesignAssetByTypeRef()` function to get a reference to the query.
const ref = getDesignAssetByTypeRef(getDesignAssetByTypeVars);
// Variables can be defined inline as well.
const ref = getDesignAssetByTypeRef({ assetType: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDesignAssetByTypeRef(dataConnect, getDesignAssetByTypeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.designAssets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.designAssets);
});
```

## ListRecentGeneratedContent
You can execute the `ListRecentGeneratedContent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRecentGeneratedContent(options?: ExecuteQueryOptions): QueryPromise<ListRecentGeneratedContentData, undefined>;

interface ListRecentGeneratedContentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRecentGeneratedContentData, undefined>;
}
export const listRecentGeneratedContentRef: ListRecentGeneratedContentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRecentGeneratedContent(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRecentGeneratedContentData, undefined>;

interface ListRecentGeneratedContentRef {
  ...
  (dc: DataConnect): QueryRef<ListRecentGeneratedContentData, undefined>;
}
export const listRecentGeneratedContentRef: ListRecentGeneratedContentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRecentGeneratedContentRef:
```typescript
const name = listRecentGeneratedContentRef.operationName;
console.log(name);
```

### Variables
The `ListRecentGeneratedContent` query has no variables.
### Return Type
Recall that executing the `ListRecentGeneratedContent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRecentGeneratedContentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListRecentGeneratedContent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRecentGeneratedContent } from '@dataconnect/generated';


// Call the `listRecentGeneratedContent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRecentGeneratedContent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRecentGeneratedContent(dataConnect);

console.log(data.generatedContents);

// Or, you can use the `Promise` API.
listRecentGeneratedContent().then((response) => {
  const data = response.data;
  console.log(data.generatedContents);
});
```

### Using `ListRecentGeneratedContent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRecentGeneratedContentRef } from '@dataconnect/generated';


// Call the `listRecentGeneratedContentRef()` function to get a reference to the query.
const ref = listRecentGeneratedContentRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRecentGeneratedContentRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.generatedContents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.generatedContents);
});
```

# Mutations

No mutations were generated for the `example` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

