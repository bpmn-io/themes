import {
  CheckboxEntry,
  CollapsibleEntry,
  DropdownButton,
  ListEntry,
  SelectEntry,
  TextFieldEntry,
  ToggleSwitchEntry,
  TooltipEntry
} from '@bpmn-io/properties-panel';

import { h } from '@bpmn-io/properties-panel/preact';


const items = [
  {
    label: 'First value',
    value: 'first'
  },
  {
    label: 'Second value',
    value: 'second'
  }
];

const options = [
  {
    label: 'First option',
    value: 'first'
  },
  {
    label: 'Second option',
    value: 'second'
  }
];

const noOp = () => {};
const immediate = (fn) => fn;

export default {
  __init__: [ 'themeControlsProvider' ],
  themeControlsProvider: [ 'type', ThemeControlsProvider ]
};


function ThemeControlsProvider(propertiesPanel) {
  propertiesPanel.registerProvider(2000, this);
}

ThemeControlsProvider.$inject = [ 'propertiesPanel' ];

ThemeControlsProvider.prototype.getGroups = function() {
  return function(groups) {
    return [
      {
        id: 'theme-controls',
        label: 'Theme controls',
        open: true,
        entries: [
          {
            id: 'theme-focus',
            component: FocusText
          },
          {
            id: 'theme-error',
            component: ErrorText
          },
          {
            id: 'theme-disabled',
            component: DisabledText
          },
          {
            id: 'theme-select',
            component: Select
          },
          {
            id: 'theme-checkbox',
            component: Checkbox
          },
          {
            id: 'theme-toggle',
            component: Toggle
          },
          {
            id: 'theme-tooltip',
            component: Tooltip
          },
          {
            id: 'theme-link',
            component: LinkText
          },
          {
            id: 'theme-list',
            component: List
          },
          {
            id: 'theme-actions',
            component: Actions
          }
        ]
      },
      ...groups
    ];
  };
};

function FocusText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-focus',
    label: 'Focused text',
    debounce: immediate,
    getValue: () => 'Example value',
    setValue: noOp
  });
}

function ErrorText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-error',
    label: 'Invalid text',
    debounce: immediate,
    getValue: () => '',
    setValue: noOp,
    validate: () => 'A value is required.'
  });
}

function DisabledText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-disabled',
    label: 'Disabled text',
    debounce: immediate,
    disabled: true,
    getValue: () => 'Unavailable',
    setValue: noOp
  });
}

function Select(props) {
  return SelectEntry({
    ...props,
    id: 'theme-select',
    label: 'Select value',
    getValue: () => 'first',
    setValue: noOp,
    getOptions: () => options
  });
}

function Checkbox(props) {
  return CheckboxEntry({
    ...props,
    id: 'theme-checkbox',
    label: 'Checked checkbox',
    getValue: () => true,
    setValue: noOp
  });
}

function Toggle(props) {
  return ToggleSwitchEntry({
    ...props,
    id: 'theme-toggle',
    label: 'Enabled toggle',
    switcherLabel: 'Enable themed controls',
    getValue: () => true,
    setValue: noOp
  });
}

function Tooltip() {
  return h('div', {
    class: 'bio-properties-panel-entry',
    'data-entry-id': 'theme-tooltip'
  }, h(TooltipEntry, {
    forId: 'theme-tooltip',
    value: h('span', null, 'Themed tooltip content. ', h('a', {
      href: '#',
      onClick: (event) => event.preventDefault()
    }, 'Learn more.'))
  }, h('span', {
    'data-theme-tooltip': true
  }, 'Tooltip content')));
}

/* the link on a normal surface; the tooltip above puts one on an inverted
   surface, and the two take different tokens */
function LinkText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-link',
    label: 'Described value',
    debounce: immediate,
    getValue: () => 'Example value',
    setValue: noOp,
    description: h('span', null, 'Supporting copy with a ', h('a', {
      href: '#',
      onClick: (event) => event.preventDefault()
    }, 'documentation link'), '.')
  });
}

function List(props) {
  return ListEntry({
    ...props,
    id: 'theme-list',
    label: 'List values',
    items,
    open: true,
    component: ListItem,
    onAdd: noOp,
    onRemove: noOp
  });
}

function ListItem(props) {
  const {
    id,
    index,
    item,
    open
  } = props;

  return CollapsibleEntry({
    ...props,
    id: `${id}-${index}`,
    label: item.label,

    // keep one item expanded, so the nested entry styling is on screen
    open: open || index === 0,
    entries: [
      {
        id: `${id}-${index}-value`,
        component: TextFieldEntry,
        label: 'Value',
        debounce: immediate,
        getValue: () => item.value,
        setValue: noOp
      }
    ]
  });
}

function Actions() {
  return h('div', {
    class: 'bio-properties-panel-entry',
    'data-entry-id': 'theme-actions'
  }, h(DropdownButton, {

    // the wrapper is what element templates style the trigger through
    class: 'bio-properties-panel-applied-template-button',
    menuItems: [
      {
        entry: 'First action',
        action: noOp
      },
      {
        separator: true
      },
      {
        entry: 'Second action',
        action: noOp
      }
    ]
  }, h('button', {
    class: 'bio-properties-panel-group-header-button bio-properties-panel-focus-ring',
    type: 'button'
  }, 'Actions')));
}
