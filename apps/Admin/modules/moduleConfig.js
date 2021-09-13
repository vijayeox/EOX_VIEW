import { React } from "oxziongui";
import DialogContainerAnnouncement from "./dialog/DialogContainerAnnouncement";
import DialogContainerProject from "./dialog/DialogContainerPrj";
import DialogContainerTeam from "./dialog/DialogContainerTeam";
import DialogContainerKra from "./dialog/DialogContainerKra";

export default {
  Organization: {},
  User: {},
  Projects: {
    title: "Manage Projects",
    dialogWindow: DialogContainerProject,
    listConfig: {
      route: "projects",
      defaultFilters: { sort: [{ field: "date_created", dir: "desc" }] },
      toolbarTemplate: (
        <h5 key={Math.random()} style={{ margin: "0px" }}>
          Project's List
        </h5>
      ),
      addButton: { title: "Add Project" },
      columnConfig: [
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
        },
      ],
      actions: [
        { name: "Edit Project Details", type: "edit", icon: "fa fa-pencil" },
        {
          name: "Add Users To Project",
          type: "assignEntity",
          icon: "fa fa-user-plus",
          prefetch: false,
          title: "Add Members",
          mainList: "/users/list",
          subList: "/project",
          members: "Users",
        },
        {
          name: "Delete Project",
          type: "delete",
          icon: "fa fa-trash manageIcons",
          route: "/project",
        },
      ],
      expandable: {
        subRoute: "project/{{uuid}}/subproject",
        columnConfig: [
          {
            title: "Name",
            field: "name",
          },
          {
            title: "Description",
            field: "description",
          },
        ],
        actions: [
          { name: "Edit Project Details", type: "edit", icon: "fa fa-pencil" },
          {
            name: "Add Users To Project",
            type: "assignEntity",
            icon: "fa fa-user-plus",
            prefetch: false,
            title: "Add Members",
            mainList: "/users/list",
            subList: "/project",
            members: "Users",
          },
          {
            name: "Delete Project",
            type: "delete",
            icon: "fa fa-trash manageIcons",
            route: "/project",
          },
        ],
      },
    },
    permission: {
      canAdd: "MANAGE_PROJECT_WRITE",
      canEdit: "MANAGE_PROJECT_WRITE",
      canDelete: "MANAGE_PROJECT_WRITE",
    },
  },
  Announcement: {
    title: "Manage Announcements",
    dialogWindow: DialogContainerAnnouncement,
    listConfig: {
      route: "announcements",
      defaultFilters: '{"sort":[{"field":"created_date","dir":"desc"}]}',
      toolbarTemplate: (
        <h5 key={Math.random()} style={{ margin: "0px" }}>
          Announcements List
        </h5>
      ),
      addButton: { title: "Create Announcement" },
      columnConfig: [
        {
          title: "Banner",
          filterCell: {
            type: "empty",
          },
          width: "150px",
          sortable: false,
          cell:
            '{item.media_type=="image"?<td className="tdImage"><img className="text-center circle gridBanner" src={baseUrl+"resource/"+item.media+"?"+new Date()} alt="Logo"/></td>:<td className="flexColCenter"><video className="text-center circle gridBanner"><source src={baseUrl+"resource/"+item.media+"?"+new Date()} type="video/mp4"/></video></td>}',
        },
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
          cell:
            '<td>{item.description ? item.description.slice(0, 150) : "No Description Added"}</td>',
        },
        {
          title: "Type",
          field: "type",
          width: "230px",
          filterCell: {
            type: "dropdown",
            listItems: ["ANNOUNCEMENT", "HOMESCREEN"],
            placeholder: "Select Type",
          },
        },
      ],
      actions: [
        { name: "Edit", type: "edit", icon: "fa fa-pencil" },
        {
          name: "Add To Team",
          type: "assignEntity",
          icon: "fa fa-users",
          prefetch: true,
        },
        { name: "Delete", type: "delete", icon: "fa fa-trash manageIcons" },
      ],
    },
    permission: {
      canAdd: "MANAGE_ANNOUNCEMENT_WRITE",
      canEdit: "MANAGE_ANNOUNCEMENT_WRITE",
      canDelete: "MANAGE_ANNOUNCEMENT_WRITE",
    },
  },
  Teams: {
    title: "Manage Teams",
    dialogWindow: DialogContainerTeam,
    listConfig: {
      route: "teams",
      defaultFilters: { sort: [{ field: "date_created", dir: "desc" }] },
      toolbarTemplate: (
        <h5 key={Math.random()} style={{ margin: "0px" }}>
          Team's List
        </h5>
      ),
      addButton: { title: "Add Team" },
      columnConfig: [
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
        },
      ],
      actions: [
        { name: "Edit Team Details", type: "edit", icon: "fa fa-pencil" },
        {
          name: "Add Users To Team",
          type: "assignEntity",
          icon: "fa fa-user-plus",
          prefetch: false,
          title: "Add Members",
          mainList: "/users/list",
          subList: "/team",
          members: "Users",
        },
        {
          name: "Delete Team",
          type: "delete",
          icon: "fa fa-trash manageIcons",
          route: "/team",
        },
      ],
      expandable: {
        subRoute: "team/{{uuid}}/subteam",
        columnConfig: [
          {
            title: "Name",
            field: "name",
          },
          {
            title: "Description",
            field: "description",
          },
        ],
        actions: [
          { name: "Edit Team Details", type: "edit", icon: "fa fa-pencil" },
          {
            name: "Add Users To Team",
            type: "assignEntity",
            icon: "fa fa-user-plus",
            prefetch: false,
            title: "Add Members",
            mainList: "/users/list",
            subList: "/team",
            members: "Users",
          },
          {
            name: "Delete Team",
            type: "delete",
            icon: "fa fa-trash manageIcons",
            route: "/team",
          },
        ],
      },
    },
    permission: {
      canAdd: "MANAGE_TEAM_WRITE",
      canEdit: "MANAGE_TEAM_WRITE",
      canDelete: "MANAGE_TEAM_WRITE",
    },
  },
  Kras: {
    title: "Manage Kras",
    dialogWindow: DialogContainerKra,
    listConfig: {
      route: "kra",
      defaultFilters: { sort: [{ field: "date_created", dir: "desc" }] },
      toolbarTemplate: (
        <h5 key={Math.random()} style={{ margin: "0px" }}>
          Kra's List
        </h5>
      ),
      addButton: { title: "Add Kra" },
      columnConfig: [
        {
          title: "Name",
          field: "name",
        },
      ],
      actions: [
        { name: "Edit Kra Details", type: "edit", icon: "fa fa-pencil" },
        {
          name: "Delete Kra",
          type: "delete",
          icon: "fa fa-trash manageIcons",
          route: "/kra",
        },
      ],
    },
    permission: {
      canAdd: "MANAGE_KRA_WRITE",
      canEdit: "MANAGE_KRA_WRITE",
      canDelete: "MANAGE_KRA_WRITE",
    },
  },
};
