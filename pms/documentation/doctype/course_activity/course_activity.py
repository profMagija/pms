# -*- coding: utf-8 -*-
# Copyright (c) 2019, profmagija and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
import frappe.utils.data as fd
from frappe.model.document import Document

class CourseActivity(Document):
	pass

@frappe.whitelist()
def get_events(doctype, start, end, filters=None):

	filters = json.loads(filters or  '[]')

	filters = [x[:4] for x in filters]

	start_date = "ifnull(time_from, '0001-01-01 00:00:00')"
	end_date = "ifnull(time_to, '2199-12-31 00:00:00')"

	filters += [
		[doctype, start_date, '<=', end],
		[doctype, end_date, '>=', start],
	]

	results = frappe.get_list(doctype, fields=['*'], filters=filters)

	return results