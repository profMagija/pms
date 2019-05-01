# -*- coding: utf-8 -*-
# Copyright (c) 2019, profmagija and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import re

RE_DATETIME = re.compile(r'(\d+-\d+-\d+) (\d+):(\d+)')

def time_to_parts(time):
	m = RE_DATETIME.match(time)

	if not m:
		return '', '', ''

	return m.group(1), m.group(2), m.group(3)



class CourseAssociate(Document):
	def validate(self):
		self.arrival_date, self.arrival_hour, self.arrival_min = time_to_parts(self.arrival_time)
		self.departure_date, self.departure_hour, self.departure_min = time_to_parts(self.departure_time)
		 
