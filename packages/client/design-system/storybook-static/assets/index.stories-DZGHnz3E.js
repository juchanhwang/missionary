import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{a as h}from"./utils-CkYB-R1u.js";const e=({as:a,className:x,children:c,typo:s,textAlign:i,style:d,ref:l,...m})=>{const y=a||"span";return t.jsx(y,{ref:l,className:h({[`typography-${s}`]:s},x),style:{textAlign:i,...d},...m,children:c})};e.displayName="Text";e.__docgenInfo={description:"",methods:[],displayName:"Text",props:{as:{required:!1,tsType:{name:"T"},description:""},ref:{required:!1,tsType:{name:"ReactComponentPropsWithRef['ref']",raw:"React.ComponentPropsWithRef<T>['ref']"},description:""}}};const j={component:e},r={render:()=>t.jsxs("div",{className:"flex flex-col gap-5 p-5",children:[t.jsx(e,{typo:"h1",children:"H1"}),t.jsx(e,{typo:"h2",children:"H2"}),t.jsx(e,{typo:"h3",children:"H3"}),t.jsx(e,{typo:"h4",children:"H4"}),t.jsx(e,{typo:"h5",children:"H5"}),t.jsx(e,{typo:"b1",children:"B1"}),t.jsx(e,{typo:"b2",children:"B2"}),t.jsx(e,{typo:"b3",children:"B3"})]}),args:{}};var o,n,p;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => {
    return <div className="flex flex-col gap-5 p-5">
        <Text typo="h1">H1</Text>
        <Text typo="h2">H2</Text>
        <Text typo="h3">H3</Text>
        <Text typo="h4">H4</Text>
        <Text typo="h5">H5</Text>
        <Text typo="b1">B1</Text>
        <Text typo="b2">B2</Text>
        <Text typo="b3">B3</Text>
      </div>;
  },
  args: {}
}`,...(p=(n=r.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const u=["Primary"];export{r as Primary,u as __namedExportsOrder,j as default};
