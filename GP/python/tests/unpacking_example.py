test = 'hello, {name}'

print test.format(name='world!')

obj = {'name': 'world!'}

# unpacking
print test.format(**obj)
