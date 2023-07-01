import sys
import pathlib

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


class DirectoryScanner:
    def __init__(self, on_file):
        self.on_file = on_file

    def scan(self, path, *args, **kwargs):
        self.scan_path(path, pathlib.Path(), args, kwargs)

    def scan_path(self, root, relative, args, kwargs):
        path = root / relative
        if path.is_dir():
            for file in path.iterdir():
                self.scan_path(root, relative / file.name, args, kwargs)
        else:
            self.on_file(path, relative, *args, **kwargs)
