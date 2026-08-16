import BpmnModeler from 'bpmn-js/lib/Modeler';
import TestContainer from 'mocha-test-container-support';
import {
  getPlaneIdFromShape
} from 'bpmn-js/lib/util/DrilldownUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  ZeebeTooltipProvider
} from 'bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';

import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import ExampleDataProviderModule from '@camunda/example-data-properties-provider';
import { ZeebeVariableResolverModule } from '@bpmn-io/variable-resolver';

import ZeebeBehaviorModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import ThemeControlsModule from './ThemeControlsProvider.js';

import camundaDesignSystemCss from '@camunda/design-system/styles.css';
import diagramJsCss from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnJsCss from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFontCss from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import propertiesPanelCss from '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import elementTemplateChooserCss from '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';
import elementTemplatesCss from 'bpmn-js-element-templates/dist/assets/element-templates.css';

import tokensCss from '../assets/tokens.css';
import propertiesPanelThemeCss from '../assets/properties-panel.css';
import c4ThemeCss from '../assets/c4.css';
import playgroundCss from './playground.css';

import defaultDiagram from './fixtures/playground.bpmn';
import manyInputsDiagram from './fixtures/many-inputs.bpmn';

let stylesInserted = false;
let activeTheme = getThemeFromUrl();

const templates = [
  {
    $schema: 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
    name: 'Example worker',
    id: 'io.bpmn-io.shadcn-theme.example-worker',
    version: 1,
    appliesTo: [
      'bpmn:ServiceTask'
    ],
    elementType: {
      value: 'bpmn:ServiceTask'
    },
    groups: [],
    properties: [
      {
        type: 'Hidden',
        value: 'example',
        binding: {
          type: 'zeebe:taskDefinition:type'
        }
      }
    ]
  }
];

export function isPlaygroundEnabled(name) {
  const singleStart = window.__env__ && window.__env__.SINGLE_START;

  return !singleStart || singleStart === 'all' || singleStart === name;
}

export function shouldKeepPlayground() {
  return Boolean(window.__env__ && window.__env__.SINGLE_START);
}

export async function createPlayground(context, name, options = {}) {
  insertStyles();

  const {
    diagram = defaultDiagram,
    exampleData = false,
    selectedElementId = 'ServiceTask_1',
    themeControls = false
  } = options;

  const root = document.createElement('div');
  root.className = 'playground';
  root.dataset.playground = name;
  root.innerHTML = `
    <div class="playground-main">
      <div class="playground-canvas"></div>
      <div class="playground-properties"></div>
    </div>
  `;

  TestContainer.get(context).appendChild(root);
  applyTheme(root);

  const canvasContainer = root.querySelector('.playground-canvas');
  const propertiesContainer = root.querySelector('.playground-properties');

  const modeler = new BpmnModeler({
    container: canvasContainer,
    debounceInput: false,
    propertiesPanel: {
      parent: propertiesContainer,
      feelPopupContainer: root,
      feelTooltipContainer: root,
      tooltip: ZeebeTooltipProvider
    },
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ZeebePropertiesProviderModule,
      CloudElementTemplatesPropertiesProviderModule,
      ElementTemplateChooserModule,
      ZeebeBehaviorModule,
      ...(exampleData ? [
        ZeebeVariableResolverModule,
        ExampleDataProviderModule
      ] : []),
      ...(themeControls ? [ ThemeControlsModule ] : [])
    ]
  });

  await modeler.importXML(diagram);

  const canvas = modeler.get('canvas');
  const eventBus = modeler.get('eventBus');
  const elementRegistry = modeler.get('elementRegistry');
  const selection = modeler.get('selection');
  const task = elementRegistry.get(selectedElementId);
  const subProcess = elementRegistry.get('SubProcess_1');

  modeler.get('elementTemplatesLoader').setTemplates(templates);
  selection.select(task);
  canvas.zoom('fit-viewport');

  const setup = {
    search: () => modeler.get('searchPad').open(),
    replace: () => modeler.get('popupMenu').open(task, 'bpmn-replace', {
      x: 180,
      y: 160
    }),
    'text-popup': () => eventBus.fire('propertiesPanel.openPopup', {
      entryId: 'ServiceTask_1-name',
      element: task,
      label: 'Name',
      title: 'Bpmn:ServiceTask / Name',
      type: 'text',
      value: 'Example worker',
      onInput: () => {},
      sourceElement: root.querySelector('input')
    }),
    'feel-popup': () => eventBus.fire('propertiesPanel.openPopup', {
      entryId: 'ServiceTask_1-priority',
      element: task,
      label: 'Priority',
      title: 'Bpmn:ServiceTask / Priority',
      type: 'feel',
      value: '1',
      variables: [],
      onInput: () => {},
      sourceElement: root.querySelector('input')
    }),
    chooser: () => modeler.get('elementTemplateChooser').open(task),
    drilldown: () => canvas.setRootElement(canvas.findRoot(getPlaneIdFromShape(subProcess))),
    'select-element': () => {
      selection.select([]);
      selection.select(task);

      return task;
    },
    'focus-theme-input': () => {
      const input = root.querySelector('[data-entry-id="theme-focus"] input');

      input.focus();

      return input;
    },
    'invalidate-theme-input': () => {
      const input = root.querySelector('[data-entry-id="theme-error"] input');

      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    'open-theme-actions': () => root.querySelector('[data-entry-id="theme-actions"] button').click(),
    'apply-template': () => {
      const elementTemplates = modeler.get('elementTemplates');
      const template = elementTemplates.getLatest(templates[0].id)[0];
      const updatedTask = elementTemplates.applyTemplate(task, template);

      selection.select([]);
      selection.select(updatedTask);

      return updatedTask;
    },
    'show-task-definition-tooltip': () => {
      const tooltipWrapper = root.querySelector(
        '[data-group-id="group-taskDefinition"] .bio-properties-panel-tooltip-wrapper'
      );

      tooltipWrapper.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    },
    'open-example-data': () => {
      const group = root.querySelector('[data-group-id="group-additionalDataGroup"]');
      const header = group.querySelector('.bio-properties-panel-group-header');

      if (![ ...header.classList ].includes('open')) {
        header.click();
      }
    },
    'activate-job-type-feel': () => {
      const entry = root.querySelector('[data-entry-id="taskDefinitionType"]');

      entry.querySelector('.bio-properties-panel-feel-icon').click();

      return entry;
    },
    'collapse-input-mapping': () => {
      const group = root.querySelector('[data-group-id="group-inputs"]');
      const header = group.querySelector('.bio-properties-panel-group-header');

      if ([ ...header.classList ].includes('open')) {
        header.click();
      }

      return group;
    },
    'open-group': (id) => {
      const group = root.querySelector(`[data-group-id="group-${id}"]`);
      const header = group.querySelector('.bio-properties-panel-group-header');

      if (![ ...header.classList ].includes('open')) {
        header.click();
      }

      return group;
    },
    'toggle-collapsible': (entryId) => {
      const entry = root.querySelector(`[data-entry-id="${entryId}"]`);
      const header = entry.querySelector('.bio-properties-panel-collapsible-entry-header');

      header.click();

      return entry;
    },
    'toggle-list-entry': (entryId) => {
      const entry = root.querySelector(`[data-entry-id="${entryId}"]`);
      const header = entry.querySelector('.bio-properties-panel-list-entry-header');

      header.click();

      return entry;
    },
    settle: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };

  return {
    element: task,
    root,
    modeler,
    setup,
    destroy() {
      modeler.destroy();
      root.remove();
    }
  };
}

export {
  manyInputsDiagram
};

function insertStyles() {
  if (stylesInserted) {
    return;
  }

  stylesInserted = true;

  insertStyle(
    'camunda-design-system.css',
    camundaDesignSystemCss.replaceAll(
      'url(./files/',
      'url("/base/node_modules/@camunda/design-system/dist/files/'
    )
  );
  insertStyle('diagram-js.css', diagramJsCss);
  insertStyle('bpmn-js.css', bpmnJsCss);
  insertStyle('bpmn-font.css', bpmnFontCss);
  insertStyle('properties-panel.css', propertiesPanelCss);
  insertStyle('element-templates.css', elementTemplatesCss);
  insertStyle('element-template-chooser.css', elementTemplateChooserCss);
  insertStyle('shadcn-tokens.css', tokensCss);
  insertStyle('shadcn-properties-panel.css', propertiesPanelThemeCss);
  insertStyle('c4-properties-panel.css', c4ThemeCss);
  insertStyle('playground.css', playgroundCss);

  insertThemeSwitcher();
}

function insertStyle(id, css) {
  const style = document.createElement('style');

  style.id = id;
  style.textContent = css;

  document.head.appendChild(style);
}

function insertThemeSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  switcher.setAttribute('aria-label', 'Reference theme');
  switcher.setAttribute('role', 'group');
  switcher.innerHTML = `
    <span class="theme-switcher__label">Theme</span>
    <button type="button" data-theme="original">Original</button>
    <button type="button" data-theme="shadcn">Shadcn</button>
    <button type="button" data-theme="c4">C4</button>
  `;

  switcher.addEventListener('click', event => {
    const button = event.target.closest('button[data-theme]');

    if (button) {
      setTheme(button.dataset.theme);
    }
  });

  window.addEventListener('popstate', () => {
    setTheme(getThemeFromUrl(), false);
  });

  document.body.appendChild(switcher);
  updateThemeSwitcher(switcher);
}

function setTheme(theme, persist = true) {
  if (theme !== 'original' && theme !== 'shadcn' && theme !== 'c4') {
    return;
  }

  activeTheme = theme;

  document.querySelectorAll('.playground').forEach(applyTheme);
  updateThemeSwitcher(document.querySelector('.theme-switcher'));

  if (persist) {
    persistThemeInUrl();
  }
}

function applyTheme(root) {
  root.classList.toggle('bpmn-io-shadcn-theme', activeTheme !== 'original');
  root.parentElement.classList.toggle('c4-ui', activeTheme === 'c4');
}

function updateThemeSwitcher(switcher) {
  switcher.querySelectorAll('button[data-theme]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.theme === activeTheme));
  });
}

function getThemeFromUrl() {
  const theme = new URLSearchParams(window.location.search).get('theme');

  return theme === 'original' || theme === 'shadcn' || theme === 'c4' ? theme : 'shadcn';
}

function persistThemeInUrl() {
  const url = new URL(window.location.href);

  url.searchParams.set('theme', activeTheme);
  window.history.pushState(null, '', url);
}
