import { queryRef, executeQuery, validateArgsWithOptions, validateArgs, makeMemoryCacheProvider } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'asafarim-digital',
  location: 'us-east4'
};
export const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
export const listAllContentTemplatesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllContentTemplates');
}
listAllContentTemplatesRef.operationName = 'ListAllContentTemplates';

export function listAllContentTemplates(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllContentTemplatesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getUserProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProjects');
}
getUserProjectsRef.operationName = 'GetUserProjects';

export function getUserProjects(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getUserProjectsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getDesignAssetByTypeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDesignAssetByType', inputVars);
}
getDesignAssetByTypeRef.operationName = 'GetDesignAssetByType';

export function getDesignAssetByType(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDesignAssetByTypeRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listRecentGeneratedContentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecentGeneratedContent');
}
listRecentGeneratedContentRef.operationName = 'ListRecentGeneratedContent';

export function listRecentGeneratedContent(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listRecentGeneratedContentRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

