import sys


class Column:
    def __init__(self, title, just="center"):
        self.title = title
        self.max = len(title)
        self.just = just

    def add(self, item):
        if len(item) > self.max:
            self.max = len(item)

    def write(self, text="", dir=None, pad=" "):
        sys.stdout.write(pad)
        sys.stdout.write(getattr(text, dir or self.just)(self.max, pad))
        sys.stdout.write(pad)
        sys.stdout.write("|")


class Table:
    def __init__(self, columns):
        self.columns = [col if isinstance(col, Column) else Column(col) for col in columns]
        self.rows = []

    def row(self, row):
        row = list(map(str, row))
        self.rows.append(row)
        for it, col in zip(row, self.columns):
            col.add(it)

    def write(self):
        sys.stdout.write("|")
        for col in self.columns:
            col.write(col.title, "ljust")
        sys.stdout.write("\n")

        sys.stdout.write("|")
        for col in self.columns:
            col.write(pad="-")
        sys.stdout.write("\n")

        for row in self.rows:
            sys.stdout.write("|")
            for it, col in zip(row, self.columns):
                col.write(it)
            sys.stdout.write("\n")
        sys.stdout.write("\n")

