/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Deferred, Execution, Stack, Runnable, Unpluggable, IOConnector, IOExecution, SandBox,
  Source, Store, Scope, NULL_STORE, NULL_SCOPE, NULL_SOURCE, ProviderNamespace,
  sourceFromProviders, storeFromProviders, scopeFromProviders,
  Provider, CleanableProvider, isCleanable, CachedFunction, cached, isCachedFunction,
  providerFromFunctions,
  FileSystem, AccessError,
  Eval, EvalExecution, Prompt, PromptExecution, Value, ValueExecution, Choices, ChoicesExecution, Choice,
  Path, PathExecution,
  ChangeDetails, ChangeLogEntry, ChangeLog, ChangeExecution, Read, ReadExecution, Run, RunExecution, ParseFn,
  Steps, StepsExecution, If, IfExecution, Copy, CopyExecution, Update, UpdateExecution, Degit, DegitExecution,
  Remove, RemoveExecution, Use, UseExecution,
  EvaluationContext, STANDARD_PIPES, Pipe, PipeMap, PipeRegistry,
} from '../index'


test('all necessary stuff are exported.', () => {
  expect(Deferred).not.toBe(undefined)
  expect(Execution).not.toBe(undefined)
  expect(Stack).not.toBe(undefined)
  expect(Runnable).not.toBe(undefined)
  expect(<Unpluggable>{}).not.toBe(undefined)
  expect(<IOConnector<any>>{}).not.toBe(undefined)
  expect(IOExecution).not.toBe(undefined)
  expect(SandBox).not.toBe(undefined)
  expect(<Source>{}).not.toBe(undefined)
  expect(<Store>{}).not.toBe(undefined)
  expect(<Scope>{}).not.toBe(undefined)
  expect(NULL_STORE).not.toBe(undefined)
  expect(NULL_SCOPE).not.toBe(undefined)
  expect(NULL_SOURCE).not.toBe(undefined)
  expect(<ProviderNamespace>{}).not.toBe(undefined)
  expect(sourceFromProviders).not.toBe(undefined)
  expect(storeFromProviders).not.toBe(undefined)
  expect(scopeFromProviders).not.toBe(undefined)
  expect(<Provider>{}).not.toBe(undefined)
  expect(<CleanableProvider>{}).not.toBe(undefined)
  expect(isCleanable).not.toBe(undefined)
  expect(<CachedFunction<any>>{}).not.toBe(undefined)
  expect(cached).not.toBe(undefined)
  expect(isCachedFunction).not.toBe(undefined)
  expect(providerFromFunctions).not.toBe(undefined)
  expect(<FileSystem>{}).not.toBe(undefined)
  expect(AccessError).not.toBe(undefined)
  expect(Eval).not.toBe(undefined)
  expect(EvalExecution).not.toBe(undefined)
  expect(Prompt).not.toBe(undefined)
  expect(PromptExecution).not.toBe(undefined)
  expect(Value).not.toBe(undefined)
  expect(ValueExecution).not.toBe(undefined)
  expect(Choices).not.toBe(undefined)
  expect(ChoicesExecution).not.toBe(undefined)
  expect(<Choice>{}).not.toBe(undefined)
  expect(Path).not.toBe(undefined)
  expect(PathExecution).not.toBe(undefined)
  expect(<ChangeDetails>{}).not.toBe(undefined)
  expect(<ChangeLogEntry>{}).not.toBe(undefined)
  expect(ChangeLog).not.toBe(undefined)
  expect(ChangeExecution).not.toBe(undefined)
  expect(Read).not.toBe(undefined)
  expect(ReadExecution).not.toBe(undefined)
  expect(Run).not.toBe(undefined)
  expect(RunExecution).not.toBe(undefined)
  expect(<ParseFn>{}).not.toBe(undefined)
  expect(Steps).not.toBe(undefined)
  expect(StepsExecution).not.toBe(undefined)
  expect(Update).not.toBe(undefined)
  expect(UpdateExecution).not.toBe(undefined)
  expect(Degit).not.toBe(undefined)
  expect(DegitExecution).not.toBe(undefined)
  expect(Remove).not.toBe(undefined)
  expect(RemoveExecution).not.toBe(undefined)
  expect(Use).not.toBe(undefined)
  expect(UseExecution).not.toBe(undefined)
  expect(Copy).not.toBe(undefined)
  expect(CopyExecution).not.toBe(undefined)
  expect(If).not.toBe(undefined)
  expect(IfExecution).not.toBe(undefined)
  expect(EvaluationContext).not.toBe(undefined)
  expect(STANDARD_PIPES).not.toBe(undefined)
  expect(<Pipe>{}).not.toBe(undefined)
  expect(<PipeMap>{}).not.toBe(undefined)
  expect(PipeRegistry).not.toBe(undefined)
})
