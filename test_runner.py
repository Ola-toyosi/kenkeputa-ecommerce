from django.test.runner import DiscoverRunner


class CustomTestRunner(DiscoverRunner):
    def build_suite(self, test_labels, extra_tests=None, **kwargs):
        # Only discover tests in these apps
        if not test_labels:
            test_labels = ["users", "products", "cart", "orders"]
        return super().build_suite(test_labels, extra_tests, **kwargs)
