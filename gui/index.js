import EOXApplication from "./src/EOXApplication";
import LeftMenuTemplate from "./src/LeftMenuTemplate";
import Notification from "./src/Notification";
import React, { lazy, Suspense,useState } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import DateComponent from "./src/components/DateComponent.js";
import CurrencySelect from "./src/components/Currency Select/currencySelect";
import countryStateList from "./src/components/data/country-state-codes";
// import * as ReactWebTabs from "react-web-tabs";
import * as ReactBootstrap from "react-bootstrap";
import * as KendoFileUploader from "@progress/kendo-react-upload";
import * as KendoReactButtons from "@progress/kendo-react-buttons";
import * as KendoReactDropDowns from "@progress/kendo-react-dropdowns";
// import * as KendoReactEditor from "@progress/kendo-react-editor";
import * as KendoReactDateInputs from "@progress/kendo-react-dateinputs";
import * as KendoReactPopup from "@progress/kendo-react-popup";
import * as KendoDataQuery from "@progress/kendo-data-query";
import * as KendoReactWindow from "@progress/kendo-react-dialogs";
import * as Window from "@progress/kendo-react-dialogs";
import * as KendoReactGrid from "@progress/kendo-react-grid";
import * as   Grid from "@progress/kendo-react-grid";
import * as  GridColumn  from "@progress/kendo-react-grid";
import * as  GridToolbar  from "@progress/kendo-react-grid";
import * as KendoReactInput from "@progress/kendo-react-inputs";
import * as Input from "@progress/kendo-react-inputs";
// import * as KendoReactRipple from "@progress/kendo-react-ripple";
import * as Ripple from "@progress/kendo-react-ripple";
import  * as   orderBy  from '@progress/kendo-data-query';
// import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { library, config } from "@fortawesome/fontawesome-svg-core";
import { fal } from "@fortawesome/pro-light-svg-icons";

import * as Moment from "moment";
import * as MomentTZ from "moment-timezone";
import * as PopupDialog from "sweetalert2";
import * as ReactStrap from "reactstrap";
// import * as Webcam from "react-webcam";
import AvatarImageCropper from "react-avatar-image-cropper";
import GridTemplate from "./src/GridTemplate";
import OX_Grid from "./src/components/OI/OX_Grid";
import DashboardManager from "./src/components/OI/DashboardManager";
import Dashboard from "./src/components/OI/Dashboard";
import DataSource from "./src/components/OI/DataSource";
import Query from "./src/components/OI/Query";
import PageContent from "./src/components/App/PageContent";
import DashboardFilter from "./src/components/OI/DashboardFilter";
import WidgetGrid from "./src/components/OI/WidgetGrid";
import WidgetRenderer from "./src/components/OI/WidgetRenderer";
import DocumentList from "./src/DocumentList";
import * as Antd from "antd";
import * as AntdIcons from "@ant-design/icons";
import Visualization from "./src/components/OI/Visualization";
import WidgetManager from "./src/components/OI/WidgetManager";
import TemplateManager from "./src/components/OI/TemplateManager";
import SSOCustom from "./src/components/Custom/SSOCustom";
import EOXGrid from "./src/components/EOXGrid/EOXGrid";
import ChildEOXGrid from "./src/components/EOXGrid/ChildEOXGrid";
import Helpers from './src/helpers'
//import Mapbox from "./src/components/Custom/Mapbox";

const LazyLoad = ({ component: Component, ...rest }) => (
  <React.Suspense
    fallback={
      <div className='spinner'>
        <div className='bounce1'></div>
        <div className='bounce2'></div>
        <div className='bounce3'></div>
      </div>
    }>
    <Component {...rest} />
  </React.Suspense>
);
// const GridTemplate = (props) => <LazyLoad component={lazy(() => import("./src/GridTemplate"))} {...props} />;
// const DashboardManager = (props) => <LazyLoad component={lazy(() => import("./src/DashboardManager"))} {...props} />;
// const Dashboard = (props) => <LazyLoad component={lazy(() => import("./src/Dashboard"))} {...props} />;
// const DataSource = (props) => <LazyLoad component={lazy(() => import("./src/DataSource"))} {...props} />;
// const Query = (props) => <LazyLoad component={lazy(() => import("./src/Query"))} {...props} />;
// const DashboardFilter = (props) => <LazyLoad component={lazy(() => import("./src/DashboardFilter"))} {...props} />;
// const WidgetGrid = (props) => <LazyLoad component={lazy(() => import("./src/WidgetGrid"))} {...props} />;
// const WidgetRenderer = (props) => <LazyLoad component={lazy(() => import("./src/WidgetRenderer"))} {...props} />;
const FormRender = (props) => <LazyLoad component={lazy(() => import("./src/components/App/FormRender"))} {...props} />;
const FormBuilder = (props) => <LazyLoad component={lazy(() => import("./src/components/App/FormBuilder"))} {...props} />;
const MultiSelect = (props) => <LazyLoad component={lazy(() => import("./src/MultiSelect"))} {...props} />;
const HTMLViewer = (props) => <LazyLoad component={lazy(() => import("./src/components/App/HTMLViewer"))} {...props} />;
const CommentsView = (props) => <LazyLoad component={lazy(() => import("./src/components/App/CommentsView"))} {...props} />;
const DocumentViewer = (props) => <LazyLoad component={lazy(() => import("./src/DocumentViewer"))} {...props} />;
const DateFormats = (props) => <LazyLoad component={lazy(() => import("./src/public/js/DateFormats.js"))} {...props} />;
const DropDown = (props) => <LazyLoad component={lazy(() => import("./src/components/Dropdown/DropDownList"))} {...props} />;
//const Visualization = (props) => <LazyLoad component={lazy(() => import("./src/Visualization"))} {...props} />;
//const WidgetManager = (props) => <LazyLoad component={lazy(() => import("./src/WidgetManager"))} {...props} />;

// const OX_Grid = lazy(() => import("./src/OX_Grid"));
// const GridTemplate = lazy(() => import("./src/GridTemplate"));
library.add(fal);

export {
  EOXApplication,
  LeftMenuTemplate,
  GridTemplate,
  Notification,
  MultiSelect,
  HTMLViewer,
  CommentsView,
  FormRender,
  OX_Grid,
  ChildEOXGrid,
  DocumentViewer,
  DashboardManager,
  Dashboard,
  WidgetGrid,
  WidgetRenderer,
  DataSource,
  Query,
  DashboardFilter,
  React,
  useState,
  PageContent,
  ReactDOM,
  DateFormats,
  AvatarImageCropper,
  ReactStrap,
  ReactBootstrap,
  // ReactWebTabs,
  // Webcam,
  KendoFileUploader,
  // KendoReactEditor,
  KendoReactDateInputs,
  KendoReactPopup,
  KendoReactDropDowns,
  KendoDataQuery,
  KendoReactButtons,
  KendoReactWindow,
  KendoReactGrid,
  KendoReactInput,
  Grid,
  GridColumn,
  GridToolbar,
  Window,
  orderBy,
  Input,
  // KendoReactRipple,
  Ripple,
  PopupDialog,
  Moment,
  MomentTZ,
  DateComponent,
  DropDown,
  CurrencySelect,
  countryStateList,
  FormBuilder,
  Suspense,
  Visualization,
  WidgetManager,
  DocumentList,
  Antd,
  AntdIcons,
  TemplateManager,
  SSOCustom,
  //  Mapbox
  EOXGrid,
  Helpers
};
