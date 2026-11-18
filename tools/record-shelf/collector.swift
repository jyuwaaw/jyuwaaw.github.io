// Apple's read-only iTunesLibrary framework. No AppleScript, passwords, audio,
// private API, or developer account is used. CLI builds are locally signed by Swift.
import Foundation
import iTunesLibrary

do {
    let library = try ITLibrary(apiVersion: "1.0")
    let playlists: [[String: Any]] = library.allPlaylists.map { p in
        ["id": p.persistentID.stringValue, "name": p.name,
         "kind": p.kind.rawValue, "distinguishedKind": p.distinguishedKind.rawValue, "master": p.isMaster,
         "tracks": p.items.map { t -> [String: Any] in
            ["id": t.persistentID.stringValue, "title": t.title,
             "artist": t.artist?.name ?? "", "album": t.album.title ?? "",
             "durationMs": t.totalTime]
         }]
    }
    let data = try JSONSerialization.data(withJSONObject: ["source": "mac-music", "formatVersion": 1,
        "readAt": ISO8601DateFormatter().string(from: Date()), "playlists": playlists], options: [.sortedKeys])
    FileHandle.standardOutput.write(data)
} catch {
    fputs("Music library read failed: \(error)\n", stderr)
    exit(1)
}
