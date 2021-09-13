#!/bin/bash

#npm rebuild node-sass
./clean.sh
./build.sh gui
./build.sh iconpacks
./build.sh themes
./build.sh apps "Admin, Announcements, Calculator, Calendar, Chat, Contacts, CRM, CRMAdmin, HelpApp, ImageUploader, Mail, MailAdmin, Preferences,Task, TaskAdmin, Analytics, Timesheet"
./build.sh bos
echo build completed successfully
