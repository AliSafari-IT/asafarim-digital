const { queryRef, executeQuery, validateArgsWithOptions, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'asafarim-digital',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listAllContentTemplatesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllContentTemplates');
}
listAllContentTemplatesRef.operationName = 'ListAllContentTemplates';
exports.listAllContentTemplatesRef = listAllContentTemplatesRef;

exports.listAllContentTemplates = function listAllContentTemplates(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllContentTemplatesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getUserProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProjects');
}
getUserProjectsRef.operationName = 'GetUserProjects';
exports.getUserProjectsRef = getUserProjectsRef;

exports.getUserProjects = function getUserProjects(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getUserProjectsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getDesignAssetByTypeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDesignAssetByType', inputVars);
}
getDesignAssetByTypeRef.operationName = 'GetDesignAssetByType';
exports.getDesignAssetByTypeRef = getDesignAssetByTypeRef;

exports.getDesignAssetByType = function getDesignAssetByType(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDesignAssetByTypeRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listRecentGeneratedContentRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecentGeneratedContent');
}
listRecentGeneratedContentRef.operationName = 'ListRecentGeneratedContent';
exports.listRecentGeneratedContentRef = listRecentGeneratedContentRef;

exports.listRecentGeneratedContent = function listRecentGeneratedContent(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listRecentGeneratedContentRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
