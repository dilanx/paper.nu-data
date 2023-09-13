# paper.nu data automation

## Key mapping

To significantly reduce data size, repeated keys are shortened. For example, instead of 3000 courses each having a `description` property, they have a `d` property, thus resulting in 10 \* 3000 less characters in the file. This takes up less bandwidth when downloading from the CDN and less storaged when cached on the client. The client can map the data in reverse if necessary.

See https://support.dilanxd.com/paper/develop/course-data for mapping.
