
frappe.views.calendar["Course Activity"] = {
    field_map: {
        "start": "time_from",
        "end": "time_to",
        "id": "name",
        "title": function (data) { return data.activity_title + "\n" + (data.extra || ""); },
        "description": "extra",
        "allDay": function(data) { return false; }
    },
    filters: [
        {
            "fieldtype": "Link",
            "fieldname": "parent",
            "options": "Course",
            "label": __("Course")
        }
    ],
    quickEntry: true,
	get_events_method: "pms.documentation.doctype.course_activity.course_activity.get_events"
};
