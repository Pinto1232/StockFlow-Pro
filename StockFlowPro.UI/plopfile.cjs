const { pascalCase, paramCase, camelCase } = require('change-case');
const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
  // Helpers
  plop.setHelper('pascalCase', txt => pascalCase(txt));
  plop.setHelper('kebabCase', txt => paramCase(txt));
  plop.setHelper('camelCase', txt => camelCase(txt));

  const componentsRoot = 'src/components';

  const ensureIndexExport = (indexPath, exportLine) => {
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, exportLine + '\n');
      return; 
    }
    const content = fs.readFileSync(indexPath, 'utf8');
    if (!content.includes(exportLine)) {
      fs.appendFileSync(indexPath, exportLine + '\n');
    }
  };

  plop.setGenerator('component', {
    description: 'Create a new UI component (with optional style, test, story)',
    prompts: [
      { type: 'input', name: 'name', message: 'Component name (e.g. UserCard):', validate: v => !!v || 'Name required' },
      { type: 'list', name: 'segment', message: 'Parent segment/folder under components?', choices: () => {
          const dirs = fs.readdirSync(componentsRoot, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);
          return ['ui', ...dirs.filter(d => d !== 'ui')];
        }
      },
  { type: 'confirm', name: 'withLoading', message: 'Include loading state scaffold?', default: true },
  { type: 'confirm', name: 'withError', message: 'Include error state scaffold?', default: true },
      { type: 'confirm', name: 'withTest', message: 'Add test file?', default: true },
      { type: 'confirm', name: 'withStory', message: 'Add story file?', default: false },
      { type: 'confirm', name: 'withStyle', message: 'Add module.css file?', default: true },
      { type: 'confirm', name: 'exportIndex', message: 'Export from segment index.ts?', default: true }
    ],
    actions: data => {
      const actions = [];
      const basePath = path.posix.join(componentsRoot.replace(/\\/g,'/'), data.segment, '{{pascalCase name}}');

      actions.push({
        type: 'add',
        path: basePath + '/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/component/Component.tsx.hbs'
      });

      if (data.withStyle) {
        actions.push({
          type: 'add',
          path: basePath + '/{{pascalCase name}}.module.css',
          templateFile: 'plop-templates/component/Component.module.css.hbs'
        });
      }

      if (data.withTest) {
        actions.push({
          type: 'add',
          path: basePath + '/{{pascalCase name}}.test.tsx',
          templateFile: 'plop-templates/component/Component.test.tsx.hbs'
        });
      }

      if (data.withStory) {
        actions.push({
          type: 'add',
          path: basePath + '/{{pascalCase name}}.stories.tsx',
          templateFile: 'plop-templates/component/Component.stories.tsx.hbs'
        });
      }

      actions.push({
        type: 'add',
        path: basePath + '/index.ts',
        template: "export * from './{{pascalCase name}}';\n"
      });

      if (data.exportIndex) {
        actions.push(function customExportIndex() {
          const segmentIndex = path.join(componentsRoot, data.segment, 'index.ts');
          const exportLine = `export * from './${pascalCase(data.name)}';`;
          ensureIndexExport(segmentIndex, exportLine);
          return `Updated ${segmentIndex}`;
        });
      }

      // Always add/update root components barrel so consumers can import from 'components'
      actions.push(function rootComponentsBarrel() {
        const rootIndex = path.join('src', 'components', 'index.ts');
        const exportLine = `export * from './${data.segment}/${pascalCase(data.name)}';`;
        if (!fs.existsSync(rootIndex)) {
          fs.writeFileSync(rootIndex, `// Auto-generated barrel exports for components\n${exportLine}\n`);
          return `Created root barrel: ${rootIndex}`;
        }
        const content = fs.readFileSync(rootIndex, 'utf8');
        if (!content.includes(exportLine)) {
          fs.appendFileSync(rootIndex, exportLine + '\n');
          return `Updated root barrel: ${rootIndex}`;
        }
        return 'Root barrel already contains export';
      });

      return actions;
    }
  });

  // Hook generator
  plop.setGenerator('hook', {
    description: 'Create a custom React hook (optionally with React Query)',
    prompts: [
      { type: 'input', name: 'name', message: 'Hook name (without use prefix, e.g. UserStats):', validate: v => !!v || 'Required' },
      { type: 'confirm', name: 'withQuery', message: 'Include React Query useQuery wrapper?', default: false },
      { type: 'confirm', name: 'withTest', message: 'Add test file?', default: true }
    ],
    actions: data => {
      const base = 'src/hooks';
      const fileBase = `${base}/use{{pascalCase name}}`;
      const actions = [
        { type: 'add', path: fileBase + '.ts', templateFile: 'plop-templates/hook/hook.ts.hbs' }
      ];
      if (data.withTest) {
        actions.push({ type: 'add', path: fileBase + '.test.ts', templateFile: 'plop-templates/hook/hook.test.ts.hbs' });
      }
      // Append export barrel in hooks index if exists
      actions.push(function hookBarrel(){
        const idx = path.join('src','hooks','index.ts');
        const exportLine = `export * from './use${pascalCase(data.name)}';`;
        if (!fs.existsSync(idx)) { fs.writeFileSync(idx, exportLine+'\n'); return 'Created hooks/index.ts'; }
        const content = fs.readFileSync(idx,'utf8');
        if (!content.includes(exportLine)) fs.appendFileSync(idx, exportLine+'\n');
        return 'Updated hooks barrel';
      });
      return actions;
    }
  });

  // Context generator
  plop.setGenerator('context', {
    description: 'Create React context + provider + hook',
    prompts: [
      { type: 'input', name: 'name', message: 'Context base name (e.g. Theme):', validate:v=>!!v||'Required' },
      { type: 'confirm', name: 'withTest', message: 'Add test?', default: true }
    ],
    actions: data => {
      const dir = 'src/contexts/{{pascalCase name}}';
      const actions = [
        { type: 'add', path: dir + '/{{pascalCase name}}Context.tsx', templateFile: 'plop-templates/context/Context.tsx.hbs' },
        { type: 'add', path: dir + '/index.ts', template: "export * from './{{pascalCase name}}Context';\n" }
      ];
      if (data.withTest) {
        actions.push({ type: 'add', path: dir + '/{{pascalCase name}}Context.test.tsx', templateFile: 'plop-templates/context/Context.test.tsx.hbs' });
      }
      actions.push(function contextRootBarrel(){
        const idx = path.join('src','contexts','index.ts');
        const line = `export * from './${pascalCase(data.name)}';`;
        if (!fs.existsSync(idx)) { fs.writeFileSync(idx, line+'\n'); return 'Created contexts/index.ts'; }
        const content = fs.readFileSync(idx,'utf8');
        if (!content.includes(line)) fs.appendFileSync(idx, line+'\n');
        return 'Updated contexts barrel';
      });
      return actions;
    }
  });

  // Service generator
  plop.setGenerator('service', {
    description: 'Create API service wrapper',
    prompts: [
      { type: 'input', name: 'name', message: 'Service name (entity, e.g. project):', validate:v=>!!v||'Required' },
      { type: 'confirm', name: 'withCrud', message: 'Include CRUD (list/get/create/update/delete)?', default: true }
    ],
    actions: data => {
      return [
        { type: 'add', path: 'src/services/{{camelCase name}}Service.ts', templateFile: 'plop-templates/service/service.ts.hbs' },
        function serviceBarrel(){
          const barrel = path.join('src','services','index.ts');
          const line = `export * from './${camelCase(data.name)}Service';`;
          if (!fs.existsSync(barrel)) { fs.writeFileSync(barrel, line+'\n'); return 'Created services/index.ts'; }
          const content = fs.readFileSync(barrel,'utf8');
          if (!content.includes(line)) fs.appendFileSync(barrel, line+'\n');
          return 'Updated services barrel';
        }
      ];
    }
  });

  // React Query hook (query + mutation skeleton)
  plop.setGenerator('query-hook', {
    description: 'Create typed React Query hooks for an entity',
    prompts: [
      { type:'input', name:'name', message:'Entity name (singular, e.g. Project):', validate:v=>!!v||'Required' },
      { type:'confirm', name:'withMutations', message:'Include create/update/delete mutations?', default:true }
    ],
    actions: () => [
      { type:'add', path:'src/hooks/use{{pascalCase name}}Query.ts', templateFile:'plop-templates/query/queryHook.ts.hbs' }
    ]
  });

  // Form generator
  plop.setGenerator('form', {
    description: 'Create a form component with react-hook-form + Zod schema',
    prompts: [
      { type:'input', name:'name', message:'Form name (e.g. User):', validate:v=>!!v||'Required' },
      { type:'confirm', name:'withSubmitHook', message:'Generate companion submit hook?', default:true }
    ],
    actions: data => {
      const dir = 'src/components/forms/{{pascalCase name}}';
      const actions = [
        { type:'add', path: dir + '/{{pascalCase name}}Form.tsx', templateFile:'plop-templates/form/Form.tsx.hbs' },
        { type:'add', path: dir + '/schema.ts', templateFile:'plop-templates/form/schema.ts.hbs' },
        { type:'add', path: dir + '/index.ts', template: "export * from './{{pascalCase name}}Form';\n" }
      ];
      if (data.withSubmitHook) {
        actions.push({ type:'add', path: dir + '/useSubmit{{pascalCase name}}Form.ts', templateFile:'plop-templates/form/useSubmitHook.ts.hbs' });
      }
      actions.push(function formsBarrel(){
        const idx = path.join('src','components','forms','index.ts');
        const line = `export * from './${pascalCase(data.name)}';`;
        if (!fs.existsSync(idx)) { fs.writeFileSync(idx, line+'\n'); return 'Created forms barrel'; }
        const content = fs.readFileSync(idx,'utf8');
        if (!content.includes(line)) fs.appendFileSync(idx, line+'\n');
        return 'Updated forms barrel';
      });
      return actions;
    }
  });
};
