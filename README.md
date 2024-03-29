# @tmplr/core

[![tests](https://github.com/loreanvictor/tmplr-core/actions/workflows/test.yml/badge.svg)](https://github.com/loreanvictor/tmplr-core/actions/workflows/test.yml)
[![coverage](https://github.com/loreanvictor/tmplr-core/actions/workflows/coverage.yml/badge.svg)](https://github.com/loreanvictor/tmplr-core/actions/workflows/coverage.yml)
[![version](https://img.shields.io/npm/v/@tmplr/core?logo=npm)](https://www.npmjs.com/package/@tmplr/core)



```bash
npm i @tmplr/core
```

Core concepts and commands for [tmplr](https://github.com/loreanvictor/tmplr). Generally, this library provides abstractions and tools for pipeline execution, where the pipeline
might need to evaluate some values either via the environment it is executed in or from some form of IO interface (e.g. user input). Ideally, this package should allow further extensibility
of tmplr in following areas:

- Creating alternative interfaces tmplr
- Creating alternative syntax parsers / serializers for tmplr
- Creating programs similar to tmplr with custom commands

<br>

## Relevant Packages

- [@tmplr/node](https://github.com/loreanvictor/tmplr-node): Node bindings for tmplr
- [@tmplr/react](https://github.com/loreanvictor/tmplr-react): Create React interfaces for tmplr / tmplr-like programs
- [@tmplr/yaml-parser](https://github.com/loreanvictor/tmplr-yaml-parser): A YAML parser for parsing tmplr / tmplr-like template files
- [@tmplr/jest](https://github.com/loreanvictor/tmplr-jest): Utilities for testing tmplr / tmplr-like applications and libraries

<br><br>

⚠️⚠️ WORK IN PROGRESS. DO NOT USE. ⚠️⚠️
