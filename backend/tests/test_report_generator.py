from hermadata.reports.report_generator import ReportGenerator


def test_animal_entry_report(report_generator: ReportGenerator):
    pdf = report_generator.build_animal_entry_report()

    assert pdf
